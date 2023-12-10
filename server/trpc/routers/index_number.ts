import {tableFormValue, tIndex, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {dIndex} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

const indexRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page} = input;
		return checkCredentialV2(ctx, async () => {
			const {count, rows} = await dIndex.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
			});

			const data = rows.map(row => row.toJSON());

			return pagingResult(count, page, limit, await Promise.all(data));
		});
	}),

	upsert: procedure
		.input(tIndex.partial({id: true}))
		.mutation(({ctx, input}) => {
			const {id = generateId('NUM-'), ...body} = input;
			return checkCredentialV2(ctx, async () => {
				await dIndex.upsert({id, ...body});

				return Success;
			});
		}),

	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await dIndex.destroy({where: input});

			return Success;
		});
	}),
});

export default indexRouters;
