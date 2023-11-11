import {Op} from 'sequelize';

import {SSupplier, sSupplier, tableFormValue, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {oSup, wherePagesV3} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export const supplierRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;
		return checkCredentialV2(ctx, async () => {
			const searcher = {[Op.iLike]: `%${search}%`};

			const where = !search
				? undefined
				: wherePagesV3<SSupplier>(
						{nama: searcher, alamat: searcher, telp: searcher},
						'or',
				  );

			const {count, rows} = await oSup.findAndCountAll({where});

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
				await oSup.upsert({...input, id: input.id ?? generateId('IS-')});

				return Success;
			});
		}),

	delete: procedure.input(zId).mutation(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			await oSup.destroy({where: {id: input.id}});

			return Success;
		});
	}),
});
