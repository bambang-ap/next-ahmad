import {WhereOptions} from 'sequelize';

import {TCustomerSPPBIn} from '@appTypes/app.type';
import {ZCreatedQty} from '@appTypes/app.zod';
import {SJ_IN_POINT} from '@constants';
import {attrParserV2, dOutItem, orderPages, sppbInGetPage} from '@database';
import {moment, qtyMap} from '@utils';

export async function getSJInGrade(where: WhereOptions<TCustomerSPPBIn>) {
	type Ret = typeof _sjIn.obj & {
		dInItems: (typeof _inItem.obj & {dOutItems: typeof outItem.obj[]})[];
	};

	const {sjIn, inItem} = sppbInGetPage();
	const qtys: (keyof ZCreatedQty)[] = ['createdAt', 'qty1', 'qty2', 'qty3'];

	const _sjIn = sjIn._modify(['id', 'id_po', 'createdAt']);
	const _inItem = inItem._modify(qtys);
	const outItem = attrParserV2(dOutItem, qtys);

	const data = await _sjIn.model.unscoped().findAll({
		where,
		attributes: _sjIn.attributes,
		include: [{..._inItem, include: [outItem]}],
		order: orderPages<Ret>({'dInItems.dOutItems.createdAt': false}),
	});

	const mappedData = data.map(e => {
		const {id, id_po, dInItems, createdAt} = e.toJSON() as unknown as Ret;

		let endDate: undefined | string,
			outItems: typeof outItem.obj[] = [];

		const isNotClosed = dInItems
			.map(itemIn => {
				const d = qtyMap(({qtyKey, num}) => {
					const qty = itemIn.dOutItems.reduce((total, s) => {
						if (num === 1) outItems.push(s);
						return total + (s[qtyKey] ?? 0);
					}, 0);

					return qty == itemIn[qtyKey];
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

export function calculatePoint(day: number) {
	return SJ_IN_POINT[day] || 0;
}

export function calculateScore(day: number, point: number) {
	if (day < 0) return 'N/A';

	switch (true) {
		case point <= 49:
			return 'E';
		case point <= 69:
			return 'D';
		case point <= 79:
			return 'C';
		case point <= 89:
			return 'B';
		case point <= 100:
			return 'A';
		default:
			return 'E';
	}
}
