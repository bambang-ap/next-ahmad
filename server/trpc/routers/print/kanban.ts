import {z} from 'zod';

import {
	attrParserV2,
	dIndex,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmDocument,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmUser,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';

export const printKanbanRouter = {
	kanban: procedure
		.input(z.object({id: z.string().array()}))
		.query(({ctx, input}) => {
			type UU = typeof knbItem.obj & {
				OrmPOItemSppbIn: typeof inItem.obj & {
					OrmCustomerPOItem: typeof poItem.obj & {
						OrmMasterItem: typeof item.obj;
					};
					OrmCustomerSPPBIn: typeof sjIn.obj;
				};
				OrmKanban: typeof knb.obj & {
					dIndex?: typeof tIndex.obj;
					OrmDocument: typeof doc.obj;
					OrmCustomerPO: typeof po.obj & {OrmCustomer: typeof cust.obj};
					[OrmKanban._aliasCreatedBy]: typeof user.obj;
				};
			};

			const tIndex = attrParserV2(dIndex);
			const knbItem = attrParserV2(OrmKanbanItem, [
				'id',
				'id_kanban',
				'id_item',
				'qty1',
				'qty2',
				'qty3',
			]);
			const knb = attrParserV2(OrmKanban, [
				'id',
				'image',
				'createdAt',
				'keterangan',
				'nomor_kanban',
				'index_id',
				'index_number',
				'list_mesin',
			]);
			const doc = attrParserV2(OrmDocument, [
				'doc_no',
				'revisi',
				'tgl_efektif',
			]);
			const po = attrParserV2(OrmCustomerPO, ['nomor_po']);
			const cust = attrParserV2(OrmCustomer, ['name']);
			const item = attrParserV2(OrmMasterItem, [
				'kode_item',
				'instruksi',
				'name',
			]);
			const inItem = attrParserV2(OrmPOItemSppbIn, ['lot_no']);
			const user = attrParserV2(OrmUser, ['name']);
			const poItem = attrParserV2(OrmCustomerPOItem, [
				'unit1',
				'unit2',
				'unit3',
				'harga',
			]);
			const sjIn = attrParserV2(OrmCustomerSPPBIn, ['nomor_surat', 'tgl']);

			return checkCredentialV2(ctx, async (): Promise<UU[]> => {
				const data = await knbItem.model.findAll({
					where: {id_kanban: input.id},
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
						return (
							input.id.indexOf(aa.id_kanban) - input.id.indexOf(bb.id_kanban)
						);
					})
					.map(async e => e.toJSON() as unknown as UU);

				return Promise.all(promisedData);
			});
		}),
};
