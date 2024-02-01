import {WhereOptions} from 'sequelize';

import {TKanbanItem, TScanTarget} from '@appTypes/app.type';
import {ZCreatedQty} from '@appTypes/app.zod';
import {
	dInItem,
	dKanban,
	dKnbItem,
	dOutItem,
	dRejItem,
	dScan,
	dScanItem,
} from '@database';
import {moment, qtyMap} from '@utils';

import {attrParserV2, orderPages} from '..';

import {calculatePoint, calculateScore} from '@utils';

export type RetGrade = Awaited<ReturnType<typeof getKanbanGrade>>;

export async function getKanbanGrade(where: WhereOptions<TKanbanItem>) {
	const qtys: (keyof ZCreatedQty)[] = ['createdAt', 'qty1', 'qty2', 'qty3'];

	const inItem = attrParserV2(dInItem, qtys);
	const knbItem = attrParserV2(dKnbItem, [...qtys, 'id']);
	const outItem = attrParserV2(dOutItem, qtys);
	const knb = attrParserV2(dKanban, ['id']);
	const scn = attrParserV2(dScan, ['status']);
	const scnItem = attrParserV2(dScanItem, qtys);
	const rejItem = attrParserV2(dRejItem, [...qtys, 'reason']);

	type Ret = typeof knbItem.obj & {
		dInItem: typeof inItem.obj & {
			dOutItems: typeof outItem.obj[];
			dKnbItems: typeof knbItem.obj[];
		};
		dKanban: typeof knb.obj & {
			dScans: (typeof scn.obj & {
				dScanItems: (typeof scnItem.obj & {
					dRejItems: typeof rejItem.obj[];
				})[];
			})[];
		};
	};

	const data = await knbItem.model.findAll({
		where,
		attributes: knbItem.attributes,
		order: orderPages<Ret>({'dInItem.dOutItems.createdAt': false}),
		include: [
			{...inItem, include: [outItem, knbItem]},
			{
				...knb,
				include: [{...scn, include: [{...scnItem, include: [rejItem]}]}],
			},
		],
	});

	const mapScore = data.map(e => {
		const {id, dInItem: itemSjIn, ...val} = e.toJSON() as unknown as Ret;
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
			startDate: val.createdAt,
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
		const val = e.toJSON() as unknown as Ret;
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
