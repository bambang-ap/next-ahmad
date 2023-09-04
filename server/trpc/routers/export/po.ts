import {z} from "zod";

import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";

const exportPoRouters = {
	po: procedure
		.input(z.object({idPo: z.string().array()}))
		.query(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				return input.idPo.map(id => ({id}));
			});
		}),
};

export default exportPoRouters;
