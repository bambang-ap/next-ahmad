import {router} from "@trpc";

import {printKanbanRouter} from "./kanban";

const printRouters = router({
	...printKanbanRouter,
});

export default printRouters;
