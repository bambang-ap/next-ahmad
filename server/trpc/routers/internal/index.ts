import {router} from '@trpc';

import {inRouters} from './inRouters';
import {itemRouters} from './itemRouters';
import {poRouters} from './poRouters';
import {supplierRouters} from './supplierRouters';

const internalRouters = router({
	item: itemRouters,
	supplier: supplierRouters,
	po: poRouters,
	in: inRouters,
});

export default internalRouters;
