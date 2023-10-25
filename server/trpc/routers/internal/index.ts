import {router} from '@trpc';

import {inRouters} from './inRouters';
import {itemRouters} from './itemRouters';
import {poRouters} from './poRouters';
import {requestRouters} from './request';
import {stockRouters} from './stockRouters';
import {supplierRouters} from './supplierRouters';

const internalRouters = router({
	item: itemRouters,
	supplier: supplierRouters,
	po: poRouters,
	in: inRouters,
	request: requestRouters,
	stock: stockRouters,
});

export default internalRouters;
