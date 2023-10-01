import {tRoute, zIds} from "@appTypes/app.zod";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMasterItem,
	OrmPOItemSppbIn,
	OrmScan,
	printScanAttributes,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";

export const printScanRouter = {
	scan: procedure.input(zIds.extend(tRoute.shape)).query(({ctx, input}) => {
		const {ids, route} = input;

		const {A, B, C, D, E, F, G, H, I, Ret} = printScanAttributes(route);

		return checkCredentialV2(ctx, async () => {
			const data = await OrmScan.findAll({
				where: {id: ids},
				attributes: A.keys,
				include: [
					{
						model: OrmKanban,
						attributes: B.keys,
						include: [
							{
								model: OrmKanbanItem,
								attributes: E.keys,
								separate: true,
								include: [
									{model: OrmMasterItem, attributes: F.keys},
									{
										model: OrmPOItemSppbIn,
										attributes: G.keys,
										include: [
											{model: OrmCustomerPOItem, attributes: H.keys},
											{model: OrmCustomerSPPBIn, attributes: I.keys},
										],
									},
								],
							},
							{
								model: OrmCustomerPO,
								attributes: C.keys,
								include: [{model: OrmCustomer, attributes: D.keys}],
							},
						],
					},
				],
			});

			// @ts-ignore
			return data.map(e => e.dataValues as typeof Ret);
		});
	}),
};
