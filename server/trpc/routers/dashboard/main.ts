import {col, FindOptions, fn} from "sequelize";

import {TDecimal, TItemUnit, UQty} from "@appTypes/app.type";
import {OrmCustomerPOItem, OrmKanbanItem, OrmPOItemSppbIn} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";
import {qtyMap} from "@utils";

type U = {unit: TItemUnit; qty: TDecimal};
export type J = Record<UQty, U[]>;

async function parseQueries(queries: Promise<any>[]) {
	const result = await Promise.all(queries);
	const numData = qtyMap(({num}, i) => {
		const data = result[i]! as U;
		return {[num]: data};
	});
	// @ts-ignore
	return numData.reduce((a, b) => ({...a, ...b})) as J;
}

const mainDashboardRouter = router({
	po: procedure.query(({ctx}) => {
		function selector(num: UQty): FindOptions {
			return {
				group: [`unit${num}`],
				attributes: [
					[`unit${num}`, "unit"],
					[fn("sum", col(`qty${num}`)), "qty"],
				],
			};
		}
		return checkCredentialV2(ctx, async (): Promise<J> => {
			const queries = [
				OrmCustomerPOItem.findAll(selector(1)),
				OrmCustomerPOItem.findAll(selector(2)),
				OrmCustomerPOItem.findAll(selector(3)),
			];

			return parseQueries(queries);
		});
	}),
	sppbIn: procedure.query(({ctx}) => {
		function selector(num: UQty): FindOptions {
			const group = `OrmCustomerPOItem.unit${num}`;
			return {
				group,
				raw: true,
				include: [{model: OrmCustomerPOItem, attributes: []}],
				attributes: [
					[col(group), "unit"],
					[fn("sum", col(`OrmPOItemSppbIn.qty${num}`)), "qty"],
				],
			};
		}
		return checkCredentialV2(ctx, async (): Promise<J> => {
			const queries = [
				OrmPOItemSppbIn.findAll(selector(1)),
				OrmPOItemSppbIn.findAll(selector(2)),
				OrmPOItemSppbIn.findAll(selector(3)),
			];

			return parseQueries(queries);
		});
	}),
	kanban: procedure.query(({ctx}) => {
		function selector(num: UQty): FindOptions {
			const group = `OrmPOItemSppbIn.OrmCustomerPOItem.unit${num}`;
			return {
				group,
				raw: true,
				include: [
					{
						attributes: [],
						model: OrmPOItemSppbIn,
						include: [{model: OrmCustomerPOItem, attributes: []}],
					},
				],
				attributes: [
					[col(group), "unit"],
					[fn("sum", col(`OrmKanbanItem.qty${num}`)), "qty"],
				],
			};
		}

		return checkCredentialV2(ctx, async (): Promise<J> => {
			const queries = [
				OrmKanbanItem.findAll(selector(1)),
				OrmKanbanItem.findAll(selector(2)),
				OrmKanbanItem.findAll(selector(3)),
			];

			return parseQueries(queries);
		});
	}),
});

export default mainDashboardRouter;
