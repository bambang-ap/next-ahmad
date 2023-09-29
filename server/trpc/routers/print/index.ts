import {z} from "zod";

import {
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tCustomerSPPBOut,
	tCustomerSPPBOutItem,
	tDocument,
	tKanban,
	tKendaraan,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	tScan,
} from "@appTypes/app.zod";
import {
	attrParser,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmCustomerSPPBOutItem,
	OrmDocument,
	OrmKanban,
	OrmKendaraan,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";

import {printKanbanRouter} from "./kanban";
import {printScanRouter} from "./scan";

const printRouters = router({
	...printKanbanRouter,
	...printScanRouter,
	sppb: router({
		out: procedure
			.input(z.object({id: z.string().array()}))
			.query(({ctx, input}) => {
				const A = attrParser(tCustomerSPPBOut, [
					"id",
					"id_customer",
					"date",
					"invoice_no",
					"keterangan",
				]);
				const B = attrParser(tKendaraan, ["name"]);
				const C = attrParser(tCustomer, ["name", "alamat"]);
				const D = attrParser(tCustomerSPPBOutItem, ["qty1", "qty2", "qty3"]);
				const E = attrParser(tPOItemSppbIn, ["lot_no"]);
				const F = attrParser(tMasterItem, [
					"instruksi",
					"kategori_mesinn",
					"name",
					"keterangan",
				]);
				const G = attrParser(tPOItem, ["unit1", "unit2", "unit3"]);
				const H = attrParser(tCustomerPO);
				const I = attrParser(tCustomerSPPBIn);
				const J = attrParser(tKanban, ["id"]);
				const K = attrParser(tScan, ["lot_no_imi"]);
				const L = attrParser(tDocument, [
					"doc_no",
					"tgl_efektif",
					"revisi",
					"terbit",
				]);

				type UU = typeof A.obj & {
					OrmKendaraan: typeof B.obj;
					OrmCustomer: typeof C.obj;
					OrmCustomerSPPBOutItems: (typeof D.obj & {
						OrmPOItemSppbIn: typeof E.obj & {
							OrmCustomerSPPBIn: typeof I.obj & {
								OrmKanbans: (typeof J.obj & {
									OrmScans: typeof K.obj[];
									OrmDocument: typeof L.obj;
								})[];
							};
							OrmMasterItem: typeof F.obj;
							OrmCustomerPOItem: typeof G.obj & {OrmCustomerPO: typeof H.obj};
						};
					})[];
				};

				return checkCredentialV2(ctx, async (): Promise<UU[]> => {
					const data = await OrmCustomerSPPBOut.findAll({
						where: input,
						attributes: A.keys,
						include: [
							{model: OrmKendaraan, attributes: B.keys},
							{model: OrmCustomer, attributes: C.keys},
							{
								separate: true,
								model: OrmCustomerSPPBOutItem,
								attributes: D.keys,
								include: [
									{
										model: OrmPOItemSppbIn,
										attributes: E.keys,
										include: [
											{
												model: OrmCustomerSPPBIn,
												attributes: I.keys,
												include: [
													{
														separate: true,
														model: OrmKanban,
														attributes: J.keys,
														include: [
															{model: OrmScan, attributes: K.keys},
															{model: OrmDocument, attributes: L.keys},
														],
													},
												],
											},
											{model: OrmMasterItem, attributes: F.keys},
											{
												attributes: G.keys,
												model: OrmCustomerPOItem,
												include: [{model: OrmCustomerPO, attributes: H.keys}],
											},
										],
									},
								],
							},
						],
					});

					// @ts-ignore
					return data.map(e => e.dataValues);
				});
			}),
	}),
});

export default printRouters;
