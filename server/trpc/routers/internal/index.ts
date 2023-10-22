import {sSupplier, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {dSItem, dSSUp} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

const internalRouters = router({
	item: router({
		get: procedure.input(tableFormValue).query(({ctx, input}) => {
			const {limit, page} = input;
			return checkCredentialV2(ctx, async () => {
				const {count, rows} = await dSItem.findAndCountAll();

				return pagingResult(
					count,
					page,
					limit,
					rows.map(e => e.toJSON()),
				);
			});
		}),
	}),
	supplier: router({
		get: procedure.input(tableFormValue).query(({ctx, input}) => {
			const {limit, page} = input;
			return checkCredentialV2(ctx, async () => {
				const {count, rows} = await dSSUp.findAndCountAll();

				return pagingResult(
					count,
					page,
					limit,
					rows.map(e => e.toJSON()),
				);
			});
		}),
		upsert: procedure
			.input(sSupplier.partial({id: true}))
			.mutation(({ctx, input}) => {
				return checkCredentialV2(ctx, async () => {
					await dSSUp.upsert({...input, id: input.id ?? generateId('IS')});

					return Success;
				});
			}),

		delete: procedure.input(zId).mutation(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				await dSSUp.destroy({where: {id: input.id}});

				return Success;
			});
		}),
	}),
});

export default internalRouters;
