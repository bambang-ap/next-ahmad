import {Op} from "sequelize";

import {TItemUnit} from "@appTypes/app.type";
import {unitData} from "@constants";
import {OrmCustomerPOItem} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";
import {qtyMap} from "@utils";

import {defaultDashboardRouter} from "./default";

const dashboardRouters = router({
	...defaultDashboardRouter,
	unitCountPoItem: procedure.query(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			const items = unitData.map(async unit => {
				const item = await OrmCustomerPOItem.findAll({
					where: {[Op.or]: qtyMap(({unitKey}) => ({[unitKey]: unit}))},
				});

				const count = item
					.map(({dataValues}) => {
						return qtyMap(({unitKey, qtyKey}) => {
							const qty = dataValues[qtyKey];
							if (!qty || dataValues[unitKey] !== unit) return null;
							return [unitKey, dataValues[unitKey], qty] as [
								typeof unitKey,
								TItemUnit,
								number,
							];
						})
							.filter(Boolean)
							.reduce((ret, [, , c]) => {
								const qty = parseFloat(c?.toString() ?? "0");
								return ret + qty;
							}, 0);
					})
					.reduce((ret, qty) => ret + qty, 0);

				return {unit, count};
			});

			return Promise.all(items);
		});
	}),
});

export default dashboardRouters;
