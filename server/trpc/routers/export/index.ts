import {zIds} from '@appTypes/app.zod';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

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
	stock: procedure.input(zIds).query(({input, ctx}) => {
		return checkCredentialV2(ctx, async () => {});
	}),
});

export default exportRouters;
