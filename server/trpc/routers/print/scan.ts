import {tRoute, zIds} from '@appTypes/app.zod';
import {printScanAttributes} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';

export const printScanRouter = {
	scan: procedure.input(zIds.extend(tRoute.shape)).query(({ctx, input}) => {
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
			Ret,
		} = printScanAttributes();

		return checkCredentialV2(ctx, async () => {
			const data = await scan.model.findAll({
				where: {id: ids, status: route},
				attributes: scan.attributes,
				include: [
					{
						...scnItem,
						include: [
							{
								...knbItem,
								include: [
									item,
									{...inItem, include: [poItem, sjIn]},
									{...kanban, include: [{...po, include: [cust]}]},
								],
							},
						],
					},
				],
			});

			// @ts-ignore
			return data.map(e => e.dataValues as typeof Ret);
		});
	}),
};
