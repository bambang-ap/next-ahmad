import {Op} from 'sequelize';

import {PagingResult} from '@appTypes/app.type';
import {sPoUpsert, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {internalPoAttributes, oPo, oPoItem} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const inRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		type RetOutput = typeof Ret;

		const {limit, page, id: supId} = input;
		const {Ret, item, po, poItem, sup} = internalPoAttributes();

		return checkCredentialV2(
			ctx,
			async (): Promise<PagingResult<RetOutput>> => {
				const {count, rows} = await po.model.findAndCountAll({
					include: [sup, {...poItem, include: [item]}],
					where: !!supId ? {sup_id: supId} : {},
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
		const {oPoItems: dSPoItems, oSup: dSSUp, id: id_po, ...po} = input ?? {};

		return checkCredentialV2(ctx, async () => {
			const [generatedPo] = await oPo.upsert({
				...po,
				id: id_po ?? generateId('IPO-'),
			});

			const includedId = dSPoItems.map(e => e.id).filter(Boolean);
			const items = dSPoItems.map(async item => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const {id, oItem: dSItem, ...poItem} = item;
				await oPoItem.upsert({
					...poItem,
					id: id ?? generateId('IPOI-'),
					id_po: generatedPo.dataValues.id,
				});
			});

			await oPoItem.destroy({where: {id: {[Op.notIn]: includedId}}});
			await Promise.all(items);

			return Success;
		});
	}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oPoItem.destroy({where: {id_po: input.id}});
			await oPo.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});
