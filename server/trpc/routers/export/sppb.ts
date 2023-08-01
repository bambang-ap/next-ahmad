import {procedure, router} from "@trpc";

const exportSppbRouters = router({
	out: procedure.query(noop),
});

export default exportSppbRouters;
