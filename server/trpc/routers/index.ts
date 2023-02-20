import {router} from '@trpc';

import basicRouters from './basic';
import customer_poRouters from './customer_po';
import menuRouters from './menu';

export const appRouter = router({
	...basicRouters,
	...customer_poRouters,
	...menuRouters,
});

// export type definition of API
export type AppRouter = typeof appRouter;
