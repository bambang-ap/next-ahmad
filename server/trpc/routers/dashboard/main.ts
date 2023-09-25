import {col, FindOptions, fn} from "sequelize";
import {z} from "zod";

import {TDecimal, TItemUnit, UQty} from "@appTypes/app.type";
import {tScanTarget} from "@appTypes/app.zod";
import {
	ORM,
	OrmCustomerPOItem,
	OrmCustomerSPPBOutItem,
	OrmKanbanItem,
	OrmPOItemSppbIn,
	OrmScan,
} from "@database";
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
	scan: procedure
		.input(z.object({target: tScanTarget}))
		.query(({ctx, input}) => {
			const {target} = input;
			async function selector(num: UQty) {
				const [query] = await ORM.query(
					`SELECT
							OrmCustomerPOItem.unit${num} AS unit,
							SUM( (OrmScan.item_${target} -> 0 ->> ${num}) :: NUMERIC ) AS qty
					FROM ${OrmScan.tableName} AS ${OrmScan.name}
							LEFT OUTER JOIN ${OrmKanbanItem.tableName} AS ${OrmKanbanItem.name}
								ON OrmScan.item_${target} -> 0 ->> 0 = OrmKanbanItem.id
							LEFT OUTER JOIN ${OrmPOItemSppbIn.tableName} AS ${OrmPOItemSppbIn.name}
								ON OrmKanbanItem.id_item = OrmPOItemSppbIn.id
							LEFT OUTER JOIN ${OrmCustomerPOItem.tableName} AS ${OrmCustomerPOItem.name}
								ON OrmPOItemSppbIn.id_item = OrmCustomerPOItem.id
					WHERE
							status_${target} = TRUE
							AND item_${target} -> 0 IS NOT NULL
					GROUP BY OrmCustomerPOItem.unit${num}`,
				);
				return query;
			}
			return checkCredentialV2(ctx, async (): Promise<J> => {
				const queries = [selector(1), selector(2), selector(3)];

				return parseQueries(queries);
			});
		}),

	sppbOut: procedure.query(({ctx}) => {
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
					[fn("sum", col(`OrmCustomerSPPBOutItem.qty${num}`)), "qty"],
				],
			};
		}

		return checkCredentialV2(ctx, async (): Promise<J> => {
			const queries = [
				OrmCustomerSPPBOutItem.findAll(selector(1)),
				OrmCustomerSPPBOutItem.findAll(selector(2)),
				OrmCustomerSPPBOutItem.findAll(selector(3)),
			];

			return parseQueries(queries);
		});
	}),
});

export default mainDashboardRouter;
