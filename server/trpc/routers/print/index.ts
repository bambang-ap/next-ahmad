import {z} from "zod";

import {
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
	printSppbOutAttributes,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";

import {printKanbanRouter} from "./kanban";
import {printScanRouter} from "./scan";

export type SppbOutGet = ReturnType<typeof printSppbOutAttributes>["Ret"];

const printRouters = router({
	...printKanbanRouter,
	...printScanRouter,
	sppb: router({
		out: procedure
			.input(z.object({id: z.string().array()}))
			.query(({ctx, input}) => {
				const {A, B, C, D, E, F, G, H, I, J, K, L} = printSppbOutAttributes();

				return checkCredentialV2(ctx, async (): Promise<SppbOutGet[]> => {
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
