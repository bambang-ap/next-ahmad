import {
	SReqForm,
	sReqForm,
	tableFormValue,
	TIndex,
	zId,
} from '@appTypes/app.zod';
import {Success} from '@constants';
import {dIndex, indexWhereAttributes, oForm} from '@database';
import {IndexNumber} from '@enum';
import {
	checkCredentialV2,
	generateId,
	genNumberIndexUpsert,
	pagingResult,
} from '@server';
import {procedure, router} from '@trpc';

export const requestRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;

		return checkCredentialV2(ctx, async () => {
			type UUU = SReqForm & {dIndex?: TIndex};

			const indexAttr = indexWhereAttributes<UUU>(
				'dIndex.prefix',
				'index_number',
				search,
			);

			const {count, rows} = await oForm.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				include: [dIndex],
				attributes: {include: [indexAttr?.attributes]},
				where: !!indexAttr?.where ? [indexAttr.where] : undefined,
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
		.input(sReqForm.partial({id: true, index_id: true, index_number: true}))
		.mutation(({ctx, input}) => {
			const {id = generateId('IRF-'), ...po} = input;

			return checkCredentialV2(ctx, async () => {
				const upsertBody = await genNumberIndexUpsert(oForm, IndexNumber.Req, {
					...po,
					id,
				});

				await oForm.upsert(upsertBody);

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
