import {z} from 'zod';

import {
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tDocument,
	tKanban,
	tKanbanItem,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	tUser,
} from '@appTypes/app.zod';
import {
	attrParser,
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

import {appRouter, RouterOutput} from '..';

export const printKanbanRouter = {
	kanban: procedure
		.input(z.object({id: z.string().array()}))
		.query(({ctx, input}) => {
			type UU = typeof A.obj & {
				qr?: RouterOutput['qr'];
				OrmMasterItem: typeof F.obj;
				OrmPOItemSppbIn: typeof G.obj & {
					OrmCustomerPOItem: typeof I.obj;
					OrmCustomerSPPBIn: typeof J.obj;
				};
				OrmKanban: typeof B.obj & {
					OrmDocument: typeof C.obj;
					OrmCustomerPO: typeof D.obj & {OrmCustomer: typeof E.obj};
					[OrmKanban._aliasCreatedBy]: typeof H.obj;
				};
			};

			const A = attrParser(tKanbanItem, [
				'id',
				'id_kanban',
				'id_item',
				'qty1',
				'qty2',
				'qty3',
			]);
			const B = attrParser(tKanban, [
				'image',
				'createdAt',
				'keterangan',
				'nomor_kanban',
				'list_mesin',
			]);
			const C = attrParser(tDocument, ['doc_no', 'revisi', 'tgl_efektif']);
			const D = attrParser(tCustomerPO, ['nomor_po']);
			const E = attrParser(tCustomer, ['name']);
			const F = attrParser(tMasterItem, ['kode_item', 'instruksi', 'name']);
			const G = attrParser(tPOItemSppbIn, ['lot_no']);
			const H = attrParser(tUser, ['name']);
			const I = attrParser(tPOItem, ['unit1', 'unit2', 'unit3']);
			const J = attrParser(tCustomerSPPBIn, ['nomor_surat', 'tgl']);

			return checkCredentialV2(ctx, async (): Promise<UU[]> => {
				const routerCaller = appRouter.createCaller(ctx);
				const data = await OrmKanbanItem.findAll({
					where: {id_kanban: input.id},
					attributes: A.keys,
					order: [['id_kanban', 'desc']],
					include: [
						{
							model: OrmKanban,
							attributes: B.keys,
							include: [
								{
									model: OrmDocument,
									attributes: C.keys,
								},
								{
									model: OrmCustomerPO,
									attributes: D.keys,
									include: [{model: OrmCustomer, attributes: E.keys}],
								},
								{
									model: OrmUser,
									attributes: H.keys,
									as: OrmKanban._aliasCreatedBy,
								},
							],
						},
						{
							model: OrmPOItemSppbIn,
							attributes: G.keys,
							include: [
								{
									attributes: I.keys,
									model: OrmCustomerPOItem,
								},
								{
									attributes: J.keys,
									model: OrmCustomerSPPBIn,
								},
							],
						},
						{
							model: OrmMasterItem,
							attributes: F.keys,
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
					.map(async e => {
						// @ts-ignore
						const val = e.dataValues as UU;
						const qr = await routerCaller.qr({input: val.id_kanban});
						return {...val, qr};
					});

				return Promise.all(promisedData);
			});
		}),
};
