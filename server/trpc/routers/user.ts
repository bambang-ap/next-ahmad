import md5 from 'md5';

import {tableFormValue, tUserUpsert, zId} from '@appTypes/app.zod';
import {Success} from '@constants';
import {dUser, ORM, wherePagesV2} from '@database';
import {checkCredentialV2, generateId, pagingResult} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

export default function userRouters() {
	return router({
		get: procedure.input(tableFormValue).query(({ctx, input}) => {
			const {limit, page, search} = input;
			return checkCredentialV2(ctx, async () => {
				const {count, rows} = await dUser.findAndCountAll({
					limit,
					offset: (page - 1) * limit,
					where: wherePagesV2([], search),
				});

				const dataRows = rows.map(e => {
					const val = e.toJSON(); // as unknown as Ret

					return val;
				});

				return pagingResult(count, page, limit, dataRows);
			});
		}),

		upsert: procedure.input(tUserUpsert).mutation(({ctx, input}) => {
			const {id = generateId('U-'), password} = input;

			return checkCredentialV2(ctx, async () => {
				const transaction = await ORM.transaction();

				const md5Pwd = !!password ? {password: md5(password)} : undefined;

				try {
					const existingId = await dUser.findOne({
						where: {id},
						attributes: {include: ['password']},
					});

					await dUser.upsert(
						{...existingId?.toJSON(), ...input, ...md5Pwd, id},
						{transaction},
					);
					await transaction.commit();
					return Success;
				} catch (err) {
					await transaction.rollback();
					throw new TRPCError({code: 'BAD_REQUEST'});
				}
			});
		}),

		delete: procedure.input(zId).mutation(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				const transaction = await ORM.transaction();

				try {
					await dUser.destroy({transaction, where: {id: input.id}});
					await transaction.commit();
					return Success;
				} catch (err) {
					await transaction.rollback();
					throw new TRPCError({code: 'BAD_REQUEST'});
				}
			});
		}),
	});
}
