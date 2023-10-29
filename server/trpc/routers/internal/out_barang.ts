import {sOutBarang, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {attrParserV2, oOut, oStock} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const outBarangRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page} = input;

		const out = attrParserV2(oOut);
		const stock = attrParserV2(oStock);

		type Ret = typeof out.obj & {
			oStock: typeof stock.obj;
		};

		return checkCredentialV2(ctx, async () => {
			const {count, rows} = await out.model.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				include: [stock],
			});

			return pagingResult(
				count,
				page,
				limit,
				rows.map(e => e.toJSON() as unknown as Ret),
			);
		});
	}),
	upsert: procedure
		.input(sOutBarang.partial({id: true}))
		.mutation(({ctx, input}) => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const {id: idForm, createdAt: _, ...po} = input;
			return checkCredentialV2(ctx, async () => {
				await oOut.upsert({
					...po,
					id: idForm ?? generateId('IOB-'),
				});

				return Success;
			});
		}),
	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oOut.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});
