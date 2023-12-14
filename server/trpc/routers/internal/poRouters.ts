import {Op} from 'sequelize';

import {PagingResult, TableFormValue} from '@appTypes/app.type';
import {sPoUpsert, tableFormValue, zId, zIds} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	getInternalPOStatus,
	indexWhereAttributes,
	internalPoAttributes,
	oPo,
	oPoItem,
	ORM,
	wherePagesV3,
} from '@database';
import {IndexNumber} from '@enum';
import {checkCredentialV2, genNumberIndexUpsert, pagingResult} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';
import {generateId} from '@utils';

export type RetPoInternal = ReturnType<typeof internalPoAttributes>['Ret'];

async function agd(input: TableFormValue, where?: any, byPassWhere = false) {
	const {id: supId, page, limit, search} = input;
	const {item, po, poItem, sup, tIndex} = internalPoAttributes();

	const whereSearch = indexWhereAttributes(
		'dIndex.prefix',
		'index_number',
		search,
	);
	const supIdWhere = !!supId ? {sup_id: supId} : undefined;

	const {count, rows: data} = await po.model.findAndCountAll({
		limit,
		include: [tIndex, sup],
		offset: (page - 1) * limit,
		attributes: {include: [whereSearch.attributes]},
		where: byPassWhere
			? where
			: !whereSearch.where
			? supIdWhere
			: {
					[Op.or]: [whereSearch.where, where],
					...supIdWhere,
			  },
	});

	const rows = await Promise.all(
		data.map(async e => {
			const val = e.toJSON() as unknown as RetPoInternal;

			const status = await getInternalPOStatus(val.id as string);

			const poItems = await poItem.model.findAll({
				include: [item],
				where: {id_po: val.id},
			});

			return {...val, oPoItems: poItems.map(f => f.toJSON()), status};
		}),
	);

	return {count, rows};
}

export const poRouters = router({
	pdf: procedure.input(zIds).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async (): Promise<RetPoInternal[]> => {
			const {rows} = await agd({limit: 9999, page: 1}, {id: input.ids}, true);

			return rows;
		});
	}),

	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;

		return checkCredentialV2(
			ctx,
			async (): Promise<PagingResult<RetPoInternal>> => {
				const searcher = {[Op.iLike]: `%${search}%`};

				const where = !search
					? undefined
					: wherePagesV3<RetPoInternal>({'$oSup.nama$': searcher}, 'or');

				const {count, rows} = await agd(input, where);

				return pagingResult(count, page, limit, rows);
			},
		);
	}),
	upsert: procedure.input(sPoUpsert).mutation(({ctx, input}) => {
		const {
			oPoItems: dSPoItems,
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			oSup: dSSUp,
			id: id_po = generateId('IPO-'),
			...po
		} = input ?? {};

		return checkCredentialV2(ctx, async () => {
			const transaction = await ORM.transaction();

			try {
				const body = await genNumberIndexUpsert(oPo, IndexNumber.InternalPO, {
					...po,
					id: id_po,
				});
				const [generatedPo] = await oPo.upsert(body, {transaction});

				const existingPoItems = id_po
					? await oPoItem.findAll({
							where: {id_po, id: {[Op.notIn]: dSPoItems.map(e => e.id!)}},
					  })
					: [];

				const excludedId = existingPoItems.map(e => e.toJSON().id);
				const items = dSPoItems.map(async item => {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const {id, oItem: dSItem, ...poItem} = item;
					await oPoItem.upsert(
						{
							...poItem,
							id: id ?? generateId('IPOI-'),
							id_po: generatedPo.dataValues.id,
						},
						{transaction},
					);
				});

				if (excludedId.length > 0) {
					await oPoItem.destroy({
						transaction,
						where: {id: excludedId},
					});
				}

				await Promise.all(items);

				await transaction.commit();
				return Success;
			} catch (err) {
				console.log(err);
				await transaction.rollback();
				throw new TRPCError({code: 'BAD_REQUEST'});
			}
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
