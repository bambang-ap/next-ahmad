import {Op, Transaction} from 'sequelize';

import {PagingResult} from '@appTypes/app.type';
import {
	SInItem,
	SInUpsert,
	sInUpsert,
	sInUpsertManual,
	SSjIn,
	tableFormValue,
	zId,
} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	indexWhereAttributes,
	internalInAttributes,
	oInItem,
	ORM,
	oSjIn,
	oStock,
	wherePagesV3,
} from '@database';
import {checkCredentialV2, generateId, genInvoice, pagingResult} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

export type InRetOutput = ReturnType<typeof internalInAttributes>['Ret'];

async function itemUpdate(
	transaction: Transaction,
	sjIn: SSjIn,
	oInItems: SInUpsert['oInItems'],
) {
	const in_id = sjIn.id;
	const includedId = oInItems.map(e => e.id).filter(Boolean);
	const items = oInItems.map(async item => {
		const {id, ...inItem} = item;
		const idItem = id ?? generateId('ISINI-');

		const prevItem = await oInItem.findOne({where: {id: idItem}});

		const result = await oInItem.upsert(
			{...inItem, in_id, id: idItem},
			{transaction},
		);

		return [...result, inItem, prevItem?.dataValues] as const;
	});

	await oInItem.destroy({
		transaction,
		where: {id: {[Op.notIn]: includedId}, in_id},
	});

	return Promise.all(items);
}

function stockUpdate(
	transaction: Transaction,
	promisedItems: (readonly [
		oInItem,
		boolean | null,
		SInUpsert['oInItems'][number],
		SInItem | undefined,
	])[],
	sup_id: string,
) {
	const stocks = promisedItems.map(async itemIn => {
		const [item, error, inItem, prevItem] = itemIn;

		const {id: id_item_in, nama, kode} = item.dataValues;

		const id_item = inItem?.oPoItem?.id_item;
		const hasIdItem = !!id_item;

		if (!error) {
			const {qty, ...stockValues} = {
				nama,
				kode,
				sup_id,
				id_item,
				unit: inItem.unit ?? inItem?.oPoItem?.unit!,
				qty: item.toJSON().qty - parseFloat(prevItem?.qty.toString() ?? '0'),
			};

			const stock = await oStock.findOne({
				where: hasIdItem ? {id_item} : {id_item_in},
			});

			if (!stock) {
				await oStock.create(
					{...stockValues, id_item_in, qty, id: generateId('IST-')},
					{transaction},
				);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const {createdAt: _, ...val} = stock.toJSON();
				await oStock.upsert({...val, qty: val.qty + qty}, {transaction});
			}
		}
	});

	return Promise.all(stocks);
}

export const inRouters = router({
	/**
	 * @param id_po
	 */
	get_closed: procedure.input(zId).query(({ctx, input}) => {
		const {inItem, poItem} = internalInAttributes();
		const id_po = input.id;

		type Ret = typeof poItem.obj & {
			oInItems: typeof inItem.obj[];
		};
		type RetOutput = {
			max: number;
			isClosed: boolean;
		} & Ret;

		return checkCredentialV2(ctx, async (): Promise<RetOutput[]> => {
			const data = await poItem.model.findAll({
				where: {id_po},
				include: [inItem],
			});

			return data.map(e => {
				const val = e.toJSON() as unknown as Ret;

				const total = val.oInItems.reduce((ret, cur) => ret + cur.qty, 0);

				return {...val, isClosed: total === val.qty, max: val.qty - total};
			});
		});
	}),
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, id: id_po, search} = input;
		const {inItem, sjIn, item, po, poItem, sup, tIndex} =
			internalInAttributes();

		return checkCredentialV2(
			ctx,
			async (): Promise<PagingResult<InRetOutput>> => {
				const searcher = {[Op.iLike]: `%${search}%`};

				const hh = indexWhereAttributes<InRetOutput>(
					'oPo.dIndex.prefix',
					'oPo.index_number',
					search,
				);

				const where = !search
					? undefined
					: {
							[Op.or]: [
								hh.where,
								wherePagesV3<InRetOutput>(
									{'$oSup.nama$': searcher, no_sj: searcher},
									'or',
								),
							],
					  };

				const {count, rows} = await sjIn.model.findAndCountAll({
					limit,
					offset: (page - 1) * limit,
					where: !!id_po ? {id_po} : where,
					attributes: {include: [hh.attributes]},
					include: [
						sup,
						{...po, include: [tIndex]},
						{
							...inItem,
							separate: true,
							include: [{...poItem, include: [item]}],
						},
					],
				});

				return pagingResult(
					count,
					page,
					limit,
					rows.map(e => e.toJSON() as unknown as InRetOutput),
				);
			},
		);
	}),

	upsert_manual: procedure.input(sInUpsertManual).mutation(({ctx, input}) => {
		const {oInItems, id: id_sj_in, no_lpb, ...sjIn} = input ?? {};

		return checkCredentialV2(ctx, async () => {
			const transaction = await ORM.transaction();

			try {
				const lpb_no = await genInvoice(
					oSjIn,
					'',
					value => value?.no_lpb ?? '0001',
					'no_lpb',
				);

				const [generatedSjIn] = await oSjIn.upsert(
					{
						...sjIn,
						no_lpb: no_lpb ?? lpb_no,
						id: id_sj_in ?? generateId('ISIN-'),
					},
					{transaction},
				);

				const in_id = generatedSjIn.dataValues.id;
				const includedId = oInItems.map(e => e.id).filter(Boolean);

				await oInItem.destroy({
					transaction,
					where: {id: {[Op.notIn]: includedId}, in_id},
				});

				const promisedItems = await itemUpdate(
					transaction,
					generatedSjIn.dataValues,
					oInItems,
				);

				await stockUpdate(transaction, promisedItems, sjIn.sup_id);

				await transaction.commit();
				return Success;
			} catch (err) {
				await transaction.rollback();
				throw new TRPCError({code: 'BAD_REQUEST'});
			}
		});
	}),

	upsert: procedure.input(sInUpsert).mutation(({ctx, input}) => {
		const {oInItems, id: id_sj_in, no_lpb, ...sjIn} = input ?? {};

		return checkCredentialV2(ctx, async () => {
			const transaction = await ORM.transaction();

			try {
				const lpb_no = await genInvoice(
					oSjIn,
					'',
					value => value?.no_lpb ?? '0001',
					'no_lpb',
				);
				const [generatedSjIn] = await oSjIn.upsert(
					{
						...sjIn,
						no_lpb: no_lpb ?? lpb_no,
						id: id_sj_in ?? generateId('ISIN-'),
					},
					{transaction},
				);

				const promisedItems = await itemUpdate(
					transaction,
					generatedSjIn.dataValues,
					oInItems,
				);

				await stockUpdate(transaction, promisedItems, sjIn.sup_id);

				await transaction.commit();
				return Success;
			} catch (err) {
				await transaction.rollback();
				throw new TRPCError({code: 'BAD_REQUEST'});
			}
		});
	}),

	delete: procedure.input(zId).mutation(({ctx, input}) => {
		const {inItem, poItem} = internalInAttributes();

		type Ret = typeof inItem.obj & {oPoItem: typeof poItem.obj};

		return checkCredentialV2(ctx, async () => {
			const transaction = await ORM.transaction();
			try {
				const prevItems = await inItem.model.findAll({
					where: {in_id: input.id},
					include: [poItem],
				});

				const updateStocks = prevItems.map(async item => {
					const {qty, id, oPoItem} = item.toJSON() as unknown as Ret;

					const where = oPoItem?.id_item
						? {id_item: oPoItem.id_item}
						: {id_item_in: id};

					const stock = await oStock.findOne({where});

					return oStock.update(
						{qty: parseFloat(stock?.dataValues.qty.toString() ?? '0') - qty},
						{transaction, where},
					);
				});

				await Promise.all(updateStocks);
				await oInItem.destroy({where: {in_id: input.id}, transaction});
				await oSjIn.destroy({where: {id: input.id}, transaction});

				await transaction.commit();
				return Success;
			} catch (err) {
				await transaction.rollback();
				throw new TRPCError({code: 'BAD_REQUEST'});
			}
		});
	}),
});
