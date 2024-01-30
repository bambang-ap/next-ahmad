import {Op, WhereOptions} from 'sequelize';

import {TCustomerSPPBIn} from '@appTypes/app.type';
import {ZCreatedQty} from '@appTypes/app.zod';
import {
	attrParserV2,
	dOutItem,
	dRejItem,
	dScanItem,
	getPrintPoAttributes,
	orderPages,
	sppbInGetPage,
	wherePagesV3,
} from '@database';
import {REJECT_REASON} from '@enum';
import {calculatePoint, calculateScore, moment, qtyMap} from '@utils';

export type RetSjGrade = Awaited<ReturnType<typeof getSJInGrade>>;
export type RetCalculateScore = ReturnType<typeof calculateScore>;

export async function getSJInGrade(where: WhereOptions<TCustomerSPPBIn>) {
	type Ret = typeof _sjIn.obj & {
		dInItems: (typeof _inItem.obj & {
			dOutItems: typeof outItem.obj[];
			dKnbItems: (typeof knbItem.obj & {
				dScanItems: (typeof scnItem.obj & {dRejItems: typeof rejItem.obj[]})[];
			})[];
		})[];
	};

	const {sjIn, inItem} = sppbInGetPage();
	const {KnbItem} = getPrintPoAttributes();
	const qtys: (keyof ZCreatedQty)[] = ['createdAt', 'qty1', 'qty2', 'qty3'];

	const _sjIn = sjIn._modify(['id', 'id_po', 'createdAt']);
	const _inItem = inItem._modify(qtys);
	const knbItem = KnbItem._modify(['id']);
	// const knbItem = KnbItem._modify(qtys);
	const outItem = attrParserV2(dOutItem, qtys);
	const scnItem = attrParserV2(dScanItem, ['id']);
	const rejItem = attrParserV2(dRejItem, [...qtys, 'reason']);

	const data = await _sjIn.model.unscoped().findAll({
		where: {
			...where,
			...wherePagesV3<Ret>(
				{
					'$dInItems.qty1$': {[Op.not]: 0},
					'$dInItems.qty2$': {[Op.not]: 0},
					'$dInItems.qty3$': {[Op.not]: 0},
				},
				'or',
			),
		},
		attributes: _sjIn.attributes,
		include: [
			{
				..._inItem,
				include: [
					outItem,
					{...knbItem, include: [{...scnItem, include: [rejItem]}]},
				],
			},
		],
		order: orderPages<Ret>({'dInItems.dOutItems.createdAt': false}),
	});

	const mappedData = data.map(e => {
		const {id, id_po, dInItems, createdAt} = e.toJSON() as unknown as Ret;

		let endDate: undefined | string,
			outItems: typeof outItem.obj[] = [];

		const isNotClosed = dInItems
			.map(itemIn => {
				const d = qtyMap(({qtyKey, num}) => {
					const kk = itemIn.dKnbItems.reduce(
						(t, s) => {
							for (const a of s.dScanItems) {
								// t[0] += a[qtyKey] ?? 0;
								for (const b of a.dRejItems) {
									if (![REJECT_REASON.TP, REJECT_REASON.SC].includes(b.reason))
										continue;
									t[1] += b[qtyKey] ?? 0;
								}
							}
							return t;
						},
						[0, 0] as [number, number],
					);

					const qty = itemIn.dOutItems.reduce((total, s) => {
						if (num === 1) outItems.push(s);
						return total + (s[qtyKey] ?? 0);
					}, 0);

					return qty + kk[1] == itemIn[qtyKey];
				});

				return !d.includes(false);
			})
			.includes(false);

		if (!isNotClosed && outItems.length > 0) {
			endDate = outItems?.[0]?.createdAt;
		}

		const retValue = {
			id,
			id_po,
			endDate,
			startDate: createdAt,
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

	return mappedData;
}

export function poCustomerSjGrade(id_po: string, sjGrades: RetSjGrade) {
	let grade: RetCalculateScore = 'N/A';
	{
		const grades = sjGrades.filter(e => e.id_po === id_po);
		const days = grades.reduce((t, e) => t + e.day, 0);

		const avgDay = Math.round(days / grades.length) || -1;
		const point = calculatePoint(avgDay);
		grade = calculateScore(avgDay, point);
	}

	return grade;
}
