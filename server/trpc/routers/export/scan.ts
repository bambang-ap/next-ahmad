import {procedure, router} from "@trpc";

const exportScanRouters = router({
	produksi: procedure.query(noop),
});

export default exportScanRouters;
