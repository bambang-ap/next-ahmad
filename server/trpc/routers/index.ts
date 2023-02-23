import {getNow} from '@server';
import {procedure, router} from '@trpc';

import basicRouters from './basic';
import customer_poRouters from './customer_po';
import kanbanRouters from './kanban';
import menuRouters from './menu';

export const appRouter = router({
	now: procedure.query(() => {
		const today = getNow();

		return today;
	}),
	menu: menuRouters,
	basic: basicRouters,
	customer_po: customer_poRouters,
	kanban: kanbanRouters,
});

export type AppRouter = typeof appRouter;
