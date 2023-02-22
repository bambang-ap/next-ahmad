import {router} from '@trpc';

import basicRouters from './basic';
import customer_poRouters from './customer_po';
import menuRouters from './menu';

export const appRouter = router({
	menu: menuRouters,
	basic: basicRouters,
	customer_po: customer_poRouters,
});

export type AppRouter = typeof appRouter;
