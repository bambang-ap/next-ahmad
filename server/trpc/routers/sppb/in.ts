import {z} from "zod";

import {
	PagingResult,
	RouterOutput,
	TCustomerPO,
	TMasterItem,
	TPOItem,
	TPOItemSppbIn,
	UnitQty,
} from "@appTypes/app.type";
import {
	tableFormValue,
	tCustomer,
	tCustomerPO,
	tCustomerSPPBIn,
	tMasterItem,
	tPOItem,
	tPOItemSppbIn,
	tUpsertSppbIn,
	zId,
} from "@appTypes/app.zod";
import {defaultLimit, Success} from "@constants";
import {
	attrParser,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmMasterItem,
	OrmPOItemSppbIn,
	wherePagesV2,
} from "@database";
import {checkCredentialV2, generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";

import {appRouter} from "..";

import {qtyMap, qtyReduce} from "@utils";

import {GetPageRows} from "../customer_po";

type GetPage = RouterOutput["sppb"]["in"]["getPage"];
export type SppbInRows = GetPage["rows"][number];

const sppbInRouters = router({
	po: router({
		gett: procedure
			.input(tCustomerPO.pick({id_customer: true}))
			.query(({ctx, input}) => {
				const A = attrParser(tCustomerPO, ["id", "nomor_po"]);
				const B = attrParser(tPOItem, [
					"id",
					"master_item_id",
					"qty1",
					"qty2",
					"qty3",
					"unit1",
					"unit2",
					"unit3",
				]);
				const C = attrParser(tMasterItem, ["name", "kode_item"]);
				const D = attrParser(tPOItemSppbIn, ["qty1", "qty2", "qty3"]);

				type Ret = typeof A.obj & {
					isClosed?: boolean;
					OrmCustomerPOItems: (typeof B.obj & {
						totalQty: UnitQty;
						isClosed?: boolean;
						OrmMasterItem: typeof C.obj;
						OrmPOItemSppbIns: typeof D.obj[];
					})[];
				};

				return checkCredentialV2(ctx, async (): Promise<Ret[]> => {
					const dataPO = await OrmCustomerPO.findAll({
						attributes: A.keys,
						where: input,
						include: [
							{
								attributes: B.keys,
								model: OrmCustomerPOItem,
								include: [
									{attributes: C.keys, model: OrmMasterItem},
									{attributes: D.keys, model: OrmPOItemSppbIn},
								],
							},
						],
					});

					return dataPO.map(e => {
						// @ts-ignore
						const val = e.dataValues as Ret;

						const u = val.OrmCustomerPOItems.map(d => {
							// @ts-ignore
							const vall = d.dataValues as typeof d;

							const totalQty = qtyReduce((r, {qtyKey}) => {
								let qty: number = r[qtyKey]!;
								vall.OrmPOItemSppbIns.forEach(itm => {
									qty += parseFloat(itm[qtyKey]!?.toString() ?? "0");
								});
								return {...r, [qtyKey]: qty};
							});

							const compare = qtyMap(({qtyKey}) => {
								if (!vall[qtyKey]) return true;
								return vall[qtyKey] == totalQty[qtyKey];
							});

							return {...vall, totalQty, isClosed: !compare.includes(false)};
						});

						return {
							...val,
							OrmCustomerPOItems: u,
							isClosed: !u.map(e => e.isClosed).includes(false),
						};
					});
				});
			}),

		get: procedure.query(({ctx}) => {
			type II = TCustomerPO & {
				OrmCustomerPOItems: (TPOItem & {
					OrmMasterItem: TMasterItem;
					OrmPOItemSppbIns: TPOItemSppbIn[];
				})[];
			};
			return checkCredentialV2(ctx, async (): Promise<GetPageRows[]> => {
				const routerCaller = appRouter.createCaller(ctx);
				const listPo = await OrmCustomerPO.findAll({
					include: [
						{
							model: OrmCustomerPOItem,
							include: [OrmMasterItem, OrmPOItemSppbIn],
						},
					],
				});

				const promisedListPo = listPo.map(({dataValues}) => {
					const val = dataValues as II;

					const u = val.OrmCustomerPOItems.map(cur => {
						const result = cur.OrmPOItemSppbIns.reduce(
							(ret, item) => ret + item.qty1,
							0,
						);
						return result === cur.qty1;
					}, []);
					return {...val, isClosed: !u.includes(false)};
				});

				const jash = await Promise.all(promisedListPo);

				const ddd = await routerCaller.customer_po.getPage({limit: 9999});

				return ddd.rows.map(e => {
					return {...e, isClosed: jash.find(u => u.id === e.id)?.isClosed};
				});
			});
		}),
	}),
	get: procedure
		.input(
			z.object({
				type: z.literal("sppb_in"),
				where: tCustomerSPPBIn.partial().optional(),
			}),
		)
		.query(async ({ctx, input}): Promise<any[]> => {
			const routerCaller = appRouter.createCaller(ctx);

			const {rows} = await routerCaller.sppb.in.getPage({
				...input,
				limit: 99999999,
			});

			return rows;
		}),
	getPage: procedure
		.input(tableFormValue.partial())
		.query(({ctx: {req, res}, input}) => {
			const {limit = defaultLimit, page = 1, search} = input;
			const A = attrParser(tCustomerSPPBIn, [
				"tgl",
				"id",
				"id_po",
				"nomor_surat",
			]);
			const B = attrParser(tCustomerPO, ["nomor_po"]);
			const C = attrParser(tCustomer, ["name", "id"]);
			const D = attrParser(tPOItemSppbIn);
			const E = attrParser(tPOItem);
			const F = attrParser(tMasterItem);

			type Ret = typeof A.obj & {
				OrmCustomerPO: typeof B.obj & {OrmCustomer: typeof C.obj};
				OrmPOItemSppbIns: (typeof D.obj & {
					OrmCustomerPOItem: typeof E.obj;
					OrmMasterItem: typeof F.obj;
				})[];
			};

			return checkCredentialV2(
				{req, res},
				async (): Promise<PagingResult<Ret>> => {
					const {count, rows: rr} = await OrmCustomerSPPBIn.findAndCountAll({
						limit,
						attributes: A.keys,
						offset: (page - 1) * limit,
						where: wherePagesV2<SppbInRows>(
							[
								"nomor_surat",
								"$OrmCustomerPO.nomor_po$",
								"$OrmCustomerPO.OrmCustomer.name$",
							],
							search,
						),
						include: [
							{
								model: OrmCustomerPO,
								attributes: B.keys,
								include: [{model: OrmCustomer, attributes: C.keys}],
							},
							{
								separate: true,
								model: OrmPOItemSppbIn,
								attributes: D.keys,
								include: [
									{model: OrmCustomerPOItem, attributes: E.keys},
									{model: OrmMasterItem, attributes: F.keys},
								],
							},
						],
					});

					// @ts-ignore
					return pagingResult(count, page, limit, rr as SppbInRows);
				},
			);
		}),
	upsert: procedure
		.input(tUpsertSppbIn)
		.mutation(({ctx: {req, res}, input}) => {
			return checkCredentialV2({req, res}, async () => {
				const {id, po_item, ...rest} = input;

				const [{dataValues: createdSppb}] = await OrmCustomerSPPBIn.upsert({
					...rest,
					id: id || generateId("SPPBIN_"),
				});

				const existingPoItemPromises = (
					await OrmPOItemSppbIn.findAll({
						where: {id_sppb_in: createdSppb.id},
					})
				).map(({dataValues}) => {
					const itemFounded = po_item.find(item => item.id === dataValues.id);
					if (!itemFounded) {
						return OrmPOItemSppbIn.destroy({where: {id: dataValues.id}});
					}
					return null;
				});

				await Promise.all(existingPoItemPromises);

				po_item.forEach(item => {
					const {id: idItem, id_item, id_sppb_in} = item;

					OrmPOItemSppbIn.upsert({
						...item,
						id_item,
						id_sppb_in: id_sppb_in || id || (createdSppb.id as string),
						id: idItem || generateId("SPPBINITM_"),
					});
				});

				return Success;
			});
		}),
	delete: procedure
		.input(zId.partial())
		.mutation(({ctx: {req, res}, input: {id}}) => {
			return checkCredentialV2({req, res}, async () => {
				return OrmPOItemSppbIn.destroy({where: {id_sppb_in: id}}).then(() =>
					OrmCustomerSPPBIn.destroy({where: {id}}),
				);
			});
		}),
});

export default sppbInRouters;
