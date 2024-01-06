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

	const _sjIn = sjIn._modify(['id', 'createdAt']);
	const _inItem = inItem._modify(qtys);
	const outItem = attrParserV2(dOutItem, qtys);

	const data = await _sjIn.model.unscoped().findAll({
		where,
		attributes: _sjIn.attributes,
		include: [{..._inItem, include: [outItem]}],
		order: orderPages<Ret>({'dInItems.dOutItems.createdAt': false}),
	});

	const mappedData = data.map(e => {
		const {id, dInItems, createdAt} = e.toJSON() as unknown as Ret;

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

				return d.includes(false);
			})
			.includes(false);

		if (isNotClosed && outItems.length > 0) {
			endDate = outItems?.[0]?.createdAt;
		}

		const retValue = {
			id,
			endDate,
			startDate: createdAt,
			get day() {
				if (!this.endDate) return -1;

				return moment(this.endDate).diff(moment(this.startDate), 'day');
			},
			get point() {
				const {day} = this;
				return SJ_IN_POINT[day] || 0;
			},
			get score() {
				const {point, day} = this;

				if (day < 0) return 'N/A';

				switch (true) {
					case point <= 100:
						return 'A';
					case point < 90:
						return 'B';
					case point < 80:
						return 'C';
					case point < 70:
						return 'D';
					case point >= 50:
						return 'E';
					default:
						return 'E';
				}
			},
		};

		return retValue;
	});

	return mappedData;
}
