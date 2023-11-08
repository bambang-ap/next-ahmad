import {Op} from 'sequelize';

import {PagingResult, TableFormValue} from '@appTypes/app.type';
import {sPoUpsert, tableFormValue, zId, zIds} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	getInternalPOStatus,
	internalPoAttributes,
	oPo,
	oPoItem,
	wherePagesV3,
} from '@database';
import {checkCredentialV2, genInvoice, pagingResult} from '@server';
import {procedure, router} from '@trpc';
import {generateId, moment} from '@utils';

export type RetPoInternal = ReturnType<typeof internalPoAttributes>['Ret'];

async function agd(input: TableFormValue, where?: any) {
	const {id: supId, page, limit} = input;
	const {item, po, poItem, sup} = internalPoAttributes();

	const {count, rows: data} = await po.model.findAndCountAll({
		limit,
		offset: (page - 1) * limit,

		// NOTE: it supposed to be like this
		// for the items, it can be loaded at modal shown
		// include: [sup, /* {...poItem, include: [item]} */],
		include: [sup, {...poItem, include: [item]}],
		where: !!supId ? {sup_id: supId, ...where} : where,
	});

	const rows = await Promise.all(
		data.map(async e => {
			const val = e.toJSON() as unknown as RetPoInternal;

			const status = await getInternalPOStatus(val.id as string);

			return {...val, status};
		}),
	);

	return {count, rows};
}

export const poRouters = router({
	getInvoice: procedure.query(() => {
		const now = moment();
		const month = now.get('month');
		const year = now.get('year');

		return genInvoice(
			oPo,
			`IMI/P.O/${month.toRoman()}/${year}`,
			value => value?.nomor_po,
			'nomor_po',
		);
	}),
	export: procedure.input(zIds).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async (): Promise<RetPoInternal[]> => {
			const {rows} = await agd(
				{limit: 9999, page: 1},
				wherePagesV3<RetPoInternal>({id: input.ids}),
			);

			return rows;
		});
	}),
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page} = input;

		return checkCredentialV2(
			ctx,
			async (): Promise<PagingResult<RetPoInternal>> => {
				const {count, rows} = await agd(input);

				return pagingResult(count, page, limit, rows);
			},
		);
	}),
	upsert: procedure.input(sPoUpsert).mutation(({ctx, input}) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const {oPoItems: dSPoItems, oSup: dSSUp, id: id_po, ...po} = input ?? {};

		return checkCredentialV2(ctx, async () => {
			const [generatedPo] = await oPo.upsert({
				...po,
				id: id_po ?? generateId('IPO-'),
			});

			const includedId = dSPoItems.map(e => e.id).filter(Boolean);
			const items = dSPoItems.map(async item => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const {id, oItem: dSItem, ...poItem} = item;
				await oPoItem.upsert({
					...poItem,
					id: id ?? generateId('IPOI-'),
					id_po: generatedPo.dataValues.id,
				});
			});

			await oPoItem.destroy({where: {id: {[Op.notIn]: includedId}}});
			await Promise.all(items);

			return Success;
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
