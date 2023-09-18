import {z} from "zod";

import {
	PagingResult,
	TCustomer,
	TCustomerPO,
	TCustomerSPPBIn,
	TMasterItem,
	TPOItem,
	TPOItemSppbIn,
} from "@appTypes/app.type";
import {
	tableFormValue,
	tCustomerSPPBIn,
	tUpsertSppbIn,
	zId,
} from "@appTypes/app.zod";
import {defaultLimit} from "@constants";
import {
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

import {GetPageRows} from "../customer_po";

type GetPage = PagingResult<SppbInRows>;
export type SppbInRows = TCustomerSPPBIn & {
	OrmCustomerPO?: TCustomerPO & {OrmCustomer: TCustomer};
	OrmCustomerPOItems?: (TPOItemSppbIn & {
		OrmCustomerPOItem?: TPOItem & {OrmMasterItem: TMasterItem};
	})[];
};

const sppbInRouters = router({
	po: router({
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
		.query(async ({ctx, input}): Promise<GetPage["rows"]> => {
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

			return checkCredentialV2({req, res}, async (): Promise<GetPage> => {
				const {count, rows: rr} = await OrmCustomerSPPBIn.findAndCountAll({
					limit,
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
						{model: OrmCustomerPO, include: [OrmCustomer]},
						{
							separate: true,
							model: OrmPOItemSppbIn,
							include: [{model: OrmCustomerPOItem, include: [OrmMasterItem]}],
						},
					],
				});

				// @ts-ignore
				return pagingResult(count, page, limit, rr as SppbInRows);
			});
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

				await Promise.all(existingPoItemPromises).then(() => {
					po_item.forEach(item => {
						const {id: idItem, id_item, id_sppb_in} = item;

						OrmPOItemSppbIn.upsert({
							...item,
							id_item,
							id_sppb_in: id_sppb_in || id || (createdSppb.id as string),
							id: idItem || generateId("SPPBINITM_"),
						});
					});
				});
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
