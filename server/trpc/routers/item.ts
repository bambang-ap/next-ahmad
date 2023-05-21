import {tableFormValue} from "@appTypes/app.zod";
import {OrmMasterItem, wherePages} from "@database";
import {checkCredentialV2, pagingResult} from "@server";
import {procedure, router} from "@trpc";

const itemRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;
		return checkCredentialV2(ctx, async () => {
			const limitation = {
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				where: wherePages([""], search),
			};

			const {count, rows} = await OrmMasterItem.findAndCountAll(limitation);

			return pagingResult(count, page, limit, rows);
		});
	}),
});

export default itemRouters;
