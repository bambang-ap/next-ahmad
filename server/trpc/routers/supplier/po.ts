import {procedure, router} from "@trpc";

const supplierPoRouters = router({
	get: procedure.query(() => null),
});

export default supplierPoRouters;
