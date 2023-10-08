import {zIds} from "@appTypes/app.zod";
import {getPrintPoAttributes} from "@database";
import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";

import {appRouter} from "..";

const exportPoRouters = {
	po: procedure.input(zIds).query(({ctx, input}) => {
		const {Ret} = getPrintPoAttributes();

		type RetOutput = typeof Ret;

		return checkCredentialV2(ctx, async (): Promise<RetOutput[]> => {
			const caller = appRouter.createCaller(ctx);
			const data = await caller.print.po(input);

			return data;
		});
	}),
};

export default exportPoRouters;
