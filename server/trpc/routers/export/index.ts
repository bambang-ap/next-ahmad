import {router} from '@trpc';

import exportKanbanRouters from './kanban';
import exportPoRouters from './po';
import exportScanRouters from './scan';
import exportSppbRouters from './sppb';

const exportRouters = router({
	...exportPoRouters,
	...exportScanRouters,
	...exportKanbanRouters,
	sppb: exportSppbRouters,
});

export default exportRouters;
