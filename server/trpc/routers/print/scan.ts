import {tRoute, zIds} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	dScan,
	literalFieldType,
	ORM,
	printScanAttributes,
	whereNearestDate,
} from '@database';
import {checkCredentialV2, procedureError} from '@server';
import {procedure} from '@trpc';

export const printScanRouter = {
	scanPrinted: procedure.input(zIds).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			const transaction = await ORM.transaction();

			try {
				const scans = await dScan.findAll({where: {id: input.ids}});
				const promisedScans = scans.map(({dataValues: {id, printed = 0}}) =>
					dScan.update({printed: printed + 1}, {where: {id}, transaction}),
				);
				await Promise.all(promisedScans);

				await transaction.commit();
				return Success;
			} catch (err) {
				await transaction.rollback();
				procedureError(err);
			}
		});
	}),
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

			const result = data.map(e => e.toJSON() as unknown as RetType);

			// await Promise.all(result.map(async (id)=>{

			// }));

			return result;
		});
	}),
};
