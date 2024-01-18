import {tRoute, zIds} from '@appTypes/app.zod';
import {
	literalFieldType,
	printScanAttributes,
	whereNearestDate,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';

export const printScanRouter = {
	scan: procedure.input(zIds.extend(tRoute.shape)).query(({ctx, input}) => {
		type RetType = typeof Ret;

		const {ids, route} = input;

		const {
			scan,
			scnItem,
			kanban,
			po,
			cust,
			knbItem,
			item,
			inItem,
			poItem,
			sjIn,
			tIndex,
			Ret,
			rejItem,
		} = printScanAttributes();

		return checkCredentialV2(ctx, async () => {
			const a = literalFieldType<RetType>('createdAt', 'dScan');
			const b = literalFieldType<RetType>('dScanItems.createdAt');

			const data = await scan.model.findAll({
				where: {id: ids, status: route},
				attributes: scan.attributes,
				include: [
					{
						...scnItem,
						where: whereNearestDate(a, b),
						include: [
							rejItem,
							{
								...knbItem,
								include: [
									item,
									{...inItem, include: [poItem, sjIn]},
									{...kanban, include: [tIndex, {...po, include: [cust]}]},
								],
							},
						],
					},
				],
			});

			return data.map(e => {
				const val = e.toJSON() as unknown as RetType;

				// const dScanItems = val.dScanItems.filter(
				// 	f => f.createdAt == val.createdAt,
				// );

				return {...val, dScanItems: val.dScanItems};
			});
		});
	}),
};
