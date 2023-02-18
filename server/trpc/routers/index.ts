import {router} from '@trpc';

import {
	customer_po_delete,
	customer_po_get,
	customer_po_insert,
	customer_po_update,
} from './customer_po';

export const appRouter = router({
	customer_po_get,
	customer_po_insert,
	customer_po_update,
	customer_po_delete,
});

// export type definition of API
export type AppRouter = typeof appRouter;
