import {router} from '@trpc';

import exportInternalRouters from './internal';
import exportKanbanRouters from './kanban';
import exportPoRouters from './po';
import exportScanRouters from './scan';
import exportSppbRouters from './sppb';

const exportRouters = router({
	...exportPoRouters,
	...exportScanRouters,
	...exportKanbanRouters,
	sppb: exportSppbRouters,
	internal: exportInternalRouters,
});

export default exportRouters;
