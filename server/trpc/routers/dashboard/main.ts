import {col, fn} from "sequelize";

import {TDecimal, TItemUnit, UQty} from "@appTypes/app.type";
import {OrmCustomerPOItem} from "@database";
import {procedure, router} from "@trpc";
import {qtyMap} from "@utils";

type U = {unit: TItemUnit; qty: TDecimal};
export type J = Record<UQty, U[]>;

const mainDashboardRouter = router({
	po: procedure.query(async (): Promise<J> => {
		const queries = [
			OrmCustomerPOItem.findAll({
				mapToModel: true,
				attributes: [
					["unit1", "unit"],
					[fn("sum", col("qty1")), "qty"],
				],
				group: ["unit1"],
			}),
			OrmCustomerPOItem.findAll({
				attributes: [
					["unit2", "unit"],
					[fn("sum", col("qty2")), "qty"],
				],
				group: ["unit2"],
			}),
			OrmCustomerPOItem.findAll({
				attributes: [
					["unit3", "unit"],
					[fn("sum", col("qty3")), "qty"],
				],
				group: ["unit3"],
			}),
		];

		const result = await Promise.all(queries);
		const hj = qtyMap(({num}, i) => {
			const data = result[i]! as U;

			return {[num]: data};
		});
		const kk = hj.reduceRight((a, b) => ({...a, ...b})) as J;

		return kk;
	}),
});

export default mainDashboardRouter;
