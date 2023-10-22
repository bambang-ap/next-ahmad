import {router} from '@trpc';

import {itemRouters} from './itemRouters';
import {poRouters} from './poRouters';
import {supplierRouters} from './supplierRouters';

const internalRouters = router({
	item: itemRouters,
	supplier: supplierRouters,
	po: poRouters,
});

export default internalRouters;
