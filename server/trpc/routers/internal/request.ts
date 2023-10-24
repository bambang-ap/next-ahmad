import {sReqForm, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {oForm} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const requestRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page} = input;

		return checkCredentialV2(ctx, async () => {
			const {count, rows} = await oForm.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
			});

			return pagingResult(
				count,
				page,
				limit,
				rows.map(e => e.toJSON()),
			);
		});
	}),
	upsert: procedure
		.input(sReqForm.partial({id: true}))
		.mutation(({ctx, input}) => {
			const {id: idForm, ...po} = input;

			return checkCredentialV2(ctx, async () => {
				await oForm.upsert({
					...po,
					id: idForm ?? generateId('IRF-'),
				});

				return Success;
			});
		}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oForm.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});
