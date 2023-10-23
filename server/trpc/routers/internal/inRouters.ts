import {Op} from 'sequelize';

import {PagingResult} from '@appTypes/app.type';
import {sInUpsert, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {internalInAttributes, oInItem, oSjIn} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const inRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		type RetOutput = typeof Ret;

		const {limit, page, id: id_po} = input;
		const {Ret, inItem, sjIn, item, po, poItem, sup} = internalInAttributes();

		return checkCredentialV2(
			ctx,
			async (): Promise<PagingResult<RetOutput>> => {
				const {count, rows} = await sjIn.model.findAndCountAll({
					include: [
						{...po, include: [sup]},
						{...inItem, include: [{...poItem, include: [item]}]},
					],
					where: !!id_po ? {id_po} : {},
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
	upsert: procedure.input(sInUpsert).mutation(({ctx, input}) => {
		const {oInItems, id: id_sj_in, ...sjIn} = input ?? {};

		return checkCredentialV2(ctx, async () => {
			const [generatedPo] = await oSjIn.upsert({
				...sjIn,
				id: id_sj_in ?? generateId('ISIN-'),
			});

			const includedId = oInItems.map(e => e.id).filter(Boolean);
			const items = oInItems.map(async item => {
				const {id, ...inItem} = item;
				await oInItem.upsert({
					...inItem,
					id: id ?? generateId('ISINI-'),
					in_id: generatedPo.dataValues.id,
				});
			});

			await oInItem.destroy({where: {id: {[Op.notIn]: includedId}}});
			await Promise.all(items);

			return Success;
		});
	}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oInItem.destroy({where: {in_id: input.id}});
			await oSjIn.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});
