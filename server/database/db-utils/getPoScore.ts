import {PO_SCORE_STATUS} from '@enum';
import {moment, qtyMap} from '@utils';

import {getPOScoreAttributes} from './attributes';
import {orderPages} from './where';

export async function getPoScore(id: string) {
	type ARet = typeof Ret;

	const {po, poItem, inItem, outItem, Ret} = getPOScoreAttributes();

	const data = await po.model.findOne({
		where: {id},
		attributes: po.attributes,
		include: [{...poItem, include: [{...inItem, include: [outItem]}]}],
		order: orderPages<ARet>({
			'dPoItems.createdAt': true,
			'dPoItems.dInItems.createdAt': false,
			'dPoItems.dInItems.dOutItems.createdAt': false,
		}),
	});

	const val = data?.toJSON() as unknown as ARet | null;
	const {dPoItems} = val ?? {};

	const maxDays = dPoItems?.map(cur => {
		const result = qtyMap(({qtyKey}) => {
			if (!cur?.[qtyKey]) return {status: PO_SCORE_STATUS.UN_PROC};

			type O = [
				qtyIn: number,
				qtyOut: number,
				dateIn?: string,
				dateOut?: string,
			];
			const uu = cur.dInItems.reduce<O>(
				(a, b) => {
					if (!a[2]) a[2] = b.createdAt;
					if (moment(a[2]) <= moment(b.createdAt)) b.createdAt;

					a[0] += b?.[qtyKey] ?? 0;
					b.dOutItems.forEach(c => {
						if (!a[3]) a[3] = c.createdAt;
						if (moment(a[3]) <= moment(c.createdAt)) c.createdAt;
						a[1] += c?.[qtyKey] ?? 0;
					});
					return a;
				},
				[0, 0, '', ''],
			);

			const isCloseIn = (cur?.[qtyKey] ?? 0) === uu[0];
			const isCloseOut = (cur?.[qtyKey] ?? 0) === uu[1];

			if (isCloseOut) {
				return {
					status: PO_SCORE_STATUS.OUT,
					days: moment(uu[3]).diff(moment(cur.createdAt), 'days'),
				};
			}

			if (isCloseIn) {
				return {
					status: PO_SCORE_STATUS.IN,
					days: moment(uu[2]).diff(moment(cur.createdAt), 'days'),
				};
			}

			return {status: PO_SCORE_STATUS.NONE};
		});

		return result;
	});

	return maxDays;
}
