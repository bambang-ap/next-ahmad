import {router} from "@trpc";

import exportScanRouters from "./scan";
import exportSppbRouters from "./sppb";

const exportRouters = router({
	sppb: exportSppbRouters,
	scan: exportScanRouters,
});

export default exportRouters;
