import {WhereOptions} from 'sequelize';

import {TKanbanItem, TScanTarget} from '@appTypes/app.type';
import {moment, qtyMap} from '@utils';

import {kanbanGradeAttributes, orderPages} from '..';

import {calculatePoint, calculateScore} from '@utils';

export type RetGradeWhere = ReturnType<typeof kanbanGradeAttributes>['Ret'];
export type RetGrade = {
	where?: WhereOptions<TKanbanItem>;
	status: (0 | 1 | 2 | 3 | 4)[];
	scores: {
		id: string;
		day: number;
		point: number;
		id_item: string;
		endDate?: string;
		startDate?: string;
		score: ReturnType<typeof calculateScore>;
		customer?: RetGradeWhere['dKanban']['dPo']['dCust'];
	}[];
};

export async function getKanbanGrade(
	where?: WhereOptions<TKanbanItem>,
	withCustomer?: boolean,
): Promise<RetGrade> {
	const {inItem, po, cust, knb, knbItem, outItem, rejItem, scn, scnItem} =
		kanbanGradeAttributes();

	const data = await knbItem.model.findAll({
		where,
		attributes: knbItem.attributes,
		order: orderPages<RetGradeWhere>({
			'dKanban.dPo.dCust.name': true,
			'dInItem.dOutItems.createdAt': false,
		}),
		include: [
			{...inItem, include: [outItem, knbItem]},
			{
				...knb,
				include: [
					{...po, include: [cust]},
					{...scn, include: [{...scnItem, include: [rejItem]}]},
				],
			},
		],
	});

	const mapScore = data.map(e => {
		const {
			id,
			id_item,
			dInItem: itemSjIn,
			...val
		} = e.toJSON() as unknown as RetGradeWhere;
		const {dKnbItems, dOutItems} = itemSjIn;

		const compare = qtyMap(({qtyKey}) => {
			const knbQty = val[qtyKey] ?? 0;
			let outQty = dOutItems.reduce((t, c) => t + (c[qtyKey] ?? 0), 0);

			if (outQty > knbQty) {
				for (const u of dKnbItems) {
					outQty -= u[qtyKey] ?? 0;
				}
				outQty += knbQty;
			}

			return knbQty === outQty;
		});

		const isClosed = !compare.includes(false);

		const retValue = {
			id,
			id_item,
			startDate: val.createdAt,
			customer: withCustomer ? val.dKanban.dPo.dCust : undefined,
			get endDate() {
				if (isClosed) {
					return dOutItems?.[0]?.createdAt;
				}
			},
			get day() {
				if (!this.endDate) return -1;
				return moment(this.endDate).diff(moment(this.startDate), 'day');
			},
			get point() {
				return calculatePoint(this.day);
			},
			get score() {
				return calculateScore(this.day, this.point);
			},
		};

		return retValue;
	});

	const mapStatus = data.map((e, i) => {
		const val = e.toJSON() as unknown as RetGradeWhere;
		const {dScans: scans} = val.dKanban;

		const outDone = mapScore[i]!.day >= 0;

		if (outDone) return 4;

		if (scans.length > 0) {
			const order: TScanTarget[] = ['finish_good', 'qc', 'produksi'];

			const sortedScans = scans.sortOrder(order, v => v.status);

			for (const {status, dScanItems} of sortedScans) {
				const compare = qtyMap(({qtyKey}) => {
					const totalScan = dScanItems.reduce((t, c) => {
						return t + (c[qtyKey] ?? 0);
					}, 0);

					return totalScan === val[qtyKey];
				});

				if (compare.includes(false)) continue;

				if (status === 'finish_good') return 3;
				if (status === 'qc') return 2;
				if (status === 'produksi') return 1;
			}
		}

		return 0;
	});

	return {
		/**
		 * @status based on KANBAN_STATUS index
		 */
		status: mapStatus,
		scores: mapScore,
		where,
	};
}
