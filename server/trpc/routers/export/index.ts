import {router} from "@trpc";

import exportKanbanRouters from "./kanban";
import exportScanRouters from "./scan";
import exportSppbRouters from "./sppb";

const exportRouters = router({
	...exportScanRouters,
	...exportKanbanRouters,
	sppb: exportSppbRouters,
});

export default exportRouters;
