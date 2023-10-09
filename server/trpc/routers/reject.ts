import {tableFormValue} from "@appTypes/app.zod";
import {getRejectAttributes} from "@database";
import {checkCredentialV2, pagingResult} from "@server";
import {procedure, router} from "@trpc";

export type RejectRetType = ReturnType<typeof getRejectAttributes>["Ret"];

const rejectRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page} = input;

		const {rejScan, scan, scanItem} = getRejectAttributes();

		return checkCredentialV2(ctx, async () => {
			const {count, rows} = await rejScan.model.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				include: [{...scanItem, include: [scan]}],
			});

			const data = rows.map(e => e.toJSON() as RejectRetType);

			return pagingResult(count, page, limit, data);
		});
	}),
});

export default rejectRouters;
