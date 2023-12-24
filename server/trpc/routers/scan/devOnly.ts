import {zId} from '@appTypes/app.zod';
import {isProd, Success} from '@constants';
import {getScanAttributesV2, ORM} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

export default function scanDevOnly() {
	type Ret1 = typeof knb.obj & {dScans: typeof scnId.obj[]};
	type Ret2 = typeof knb.obj & {
		dScans: (typeof scnId.obj & {
			dScanItems: (typeof scItemId.obj & {dRejItems: typeof sciReject.obj[]})[];
		})[];
	};

	const {knb, scItemId, sciReject, scnId} = getScanAttributesV2();

	const aa = procedure.input(zId);

	return router({
		get: aa.query(({ctx, input}) => {
			if (isProd) throw new TRPCError({code: 'NOT_FOUND'});

			return checkCredentialV2(ctx, async () => {
				const data = await knb.model.findOne({
					where: input,
					include: [scnId],
					attributes: knb.attributes,
				});

				return (data?.toJSON() as unknown as Ret1).dScans.length > 0;
			});
		}),

		remove: aa.mutation(({ctx, input}) => {
			if (isProd) throw new TRPCError({code: 'NOT_FOUND'});

			return checkCredentialV2(ctx, async () => {
				const transaction = await ORM.transaction();

				try {
					const data = await knb.model.findOne({
						where: input,
						attributes: knb.attributes,
						include: [
							{...scnId, include: [{...scItemId, include: [sciReject]}]},
						],
					});

					const value = data?.toJSON() as unknown as Ret2;

					for (const a of value.dScans) {
						for (const b of a.dScanItems) {
							for (const c of b.dRejItems) {
								await sciReject.model.destroy({transaction, where: {id: c.id}});
							}
							await scItemId.model.destroy({transaction, where: {id: b.id}});
						}
						await scnId.model.destroy({transaction, where: {id: a.id}});
					}

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
