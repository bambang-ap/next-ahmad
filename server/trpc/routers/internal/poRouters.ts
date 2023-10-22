import {Op} from 'sequelize';

import {PagingResult} from '@appTypes/app.type';
import {sPoUpsert, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {dSPo, dSPoItem, internalPoAttributes} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const poRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		type RetOutput = typeof Ret;

		const {limit, page} = input;
		const {Ret, item, po, poItem, sup} = internalPoAttributes();

		return checkCredentialV2(
			ctx,
			async (): Promise<PagingResult<RetOutput>> => {
				const {count, rows} = await po.model.findAndCountAll({
					include: [sup, {...poItem, include: [item]}],
				});

				return pagingResult(
					count,
					page,
					limit,
					rows.map(e => e.toJSON() as unknown as RetOutput),
				);
			},
		);
	}),
	upsert: procedure.input(sPoUpsert).mutation(({ctx, input}) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {dSPoItems, dSSUp: _, id: id_po, ...po} = input ?? {};

		return checkCredentialV2(ctx, async () => {
			const [generatedPo] = await dSPo.upsert({
				...po,
				id: id_po ?? generateId('IPO-'),
			});

			const includedId = dSPoItems.map(e => e.id).filter(Boolean);
			const items = dSPoItems.map(async item => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const {id, dSItem: __, ...poItem} = item;
				await dSPoItem.upsert({
					...poItem,
					id: id ?? generateId('SPOI-'),
					id_po: generatedPo.dataValues.id,
				});
			});

			await dSPoItem.destroy({where: {id: {[Op.notIn]: includedId}}});
			await Promise.all(items);

			return Success;
		});
	}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await dSPoItem.destroy({where: {id_po: input.id}});
			await dSPo.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});
