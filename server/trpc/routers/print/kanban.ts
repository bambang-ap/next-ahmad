import {ZIds, zIds} from '@appTypes/app.zod';
import {kanbanPrintAttr, OrmKanban} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';

export const printKanbanRouter = {
	kanban: procedure.input(zIds).query(({ctx, input}) => {
		return checkCredentialV2(ctx, () => {
			return getPrintKanbanData(input);
		});
	}),
};

export type UU = ReturnType<typeof kanbanPrintAttr>['Ret'];

export async function getPrintKanbanData(input: ZIds): Promise<UU[]> {
	const {
		cust,
		doc,
		inItem,
		item,
		knbItem,
		knb,
		po,
		poItem,
		sjIn,
		tIndex,
		user,
	} = kanbanPrintAttr();

	const data = await knbItem.model.findAll({
		where: {id_kanban: input.ids},
		attributes: knbItem.attributes,
		order: [['id_kanban', 'desc']],
		include: [
			{...inItem, include: [{...poItem, include: [item]}, sjIn]},
			{
				...knb,
				include: [
					doc,
					tIndex,
					{...po, include: [cust]},
					{...user, as: OrmKanban._aliasCreatedBy},
				],
			},
		],
	});

	const promisedData = data
		.sort((a, b) => {
			const aa = a.dataValues;
			const bb = b.dataValues;
			return input.ids.indexOf(aa.id_kanban) - input.ids.indexOf(bb.id_kanban);
		})
		.map(e => e.toJSON());

	return Promise.all(promisedData) as unknown as Promise<UU[]>;
}
