import {TScanTarget, ZId} from '@appTypes/app.type';
import {through} from '@constants';
import {
	attrParserV2,
	dInItem,
	dKanban,
	dPo,
	dPoItem,
	dScan,
	dSJIn,
	dSjOut,
	oInItem,
	oPo,
	oPoItem,
} from '@database';
import {INTERNAL_PO_STATUS, PO_STATUS} from '@enum';
import {moment} from '@utils';

export async function getCurrentPOStatus(id: string): Promise<PO_STATUS> {
	interface RootObject {
		id: string;
		dKanbans?: {
			id: string;
			dScans?: {
				id: string;
				status: TScanTarget;
			};
		};
		dPoItems?: {
			id: string;
			dInItems?: {
				id: string;
				dSJIn?: {
					id: string;
					dSjOuts?: ZId;
				};
			};
		};
	}

	const attributes = ['id'];
	const dd = await dPo.findAll({
		attributes,
		raw: true,
		nest: true,
		where: {id},
		include: [
			{
				model: dKanban,
				attributes,
				include: [{model: dScan, attributes: ['id', 'status']}],
			},
			{
				model: dPoItem,
				attributes,
				include: [
					{
						model: dInItem,
						attributes,
						include: [
							{
								model: dSJIn,
								attributes,
								include: [{model: dSjOut, through, attributes}],
							},
						],
					},
				],
			},
		],
	});

	const val = dd as unknown as RootObject[];

	const stats: PO_STATUS[] = [];

	for (const item of val) {
		if (item.id) stats.push(PO_STATUS.A);
		if (item.dKanbans?.id) stats.push(PO_STATUS.C);
		if (item.dKanbans?.dScans?.status === 'finish_good')
			stats.push(PO_STATUS.F);
		if (item.dKanbans?.dScans?.status === 'qc') stats.push(PO_STATUS.E);
		if (item.dKanbans?.dScans?.status === 'produksi') stats.push(PO_STATUS.D);
		if (item.dPoItems?.dInItems?.dSJIn?.dSjOuts?.id) stats.push(PO_STATUS.G);
		if (item.dPoItems?.dInItems?.dSJIn) stats.push(PO_STATUS.B);
	}

	if (stats.includes(PO_STATUS.G)) return PO_STATUS.G;
	if (stats.includes(PO_STATUS.F)) return PO_STATUS.F;
	if (stats.includes(PO_STATUS.E)) return PO_STATUS.E;
	if (stats.includes(PO_STATUS.D)) return PO_STATUS.D;
	if (stats.includes(PO_STATUS.C)) return PO_STATUS.C;
	if (stats.includes(PO_STATUS.B)) return PO_STATUS.B;
	return PO_STATUS.A;
}

export async function getInternalPOStatus(
	id: string,
): Promise<INTERNAL_PO_STATUS | undefined> {
	type Ret = typeof aPo.obj & {
		oPoItems: (typeof aPoItem.obj & {oInItems: typeof aInItem.obj[]})[];
	};

	const aPo = attrParserV2(oPo, ['due_date']);
	const aPoItem = attrParserV2(oPoItem, ['qty']);
	const aInItem = attrParserV2(oInItem, ['qty']);

	const po = await aPo.model.findOne({
		// logging: true,
		where: {id},
		attributes: aPo.attributes,
		include: [{...aPoItem, include: [aInItem]}],
	});

	if (!!po) {
		const {due_date, oPoItems} = po.toJSON() as unknown as Ret;

		const now = moment(),
			mDue = moment(due_date);
		if (mDue.diff(now, 'minute') < 0) return INTERNAL_PO_STATUS.D;

		const y = oPoItems.map(f => {
			const j = f.oInItems.reduce((total, {qty}) => total + qty, 0);
			return f.qty === j;
		});

		if (y.length > 1 && y.includes(false) && y.includes(true))
			return INTERNAL_PO_STATUS.B;
		if (y.length > 0 && !y.includes(false)) return INTERNAL_PO_STATUS.C;

		// return INTERNAL_PO_STATUS.C;
		// return INTERNAL_PO_STATUS.B;
		return INTERNAL_PO_STATUS.A;
	}

	return;
}
