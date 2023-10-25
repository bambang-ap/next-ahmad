import {TScanTarget, ZId} from '@appTypes/app.type';
import {through} from '@constants';
import {dInItem, dKanban, dPo, dPoItem, dScan, dSJIn, dSjOut} from '@database';
import {PO_STATUS} from '@enum';

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
