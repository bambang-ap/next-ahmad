import {z} from 'zod';

import {OrmCustomerSPPBOut} from '@database';
import {genInvoice} from '@server';
import {procedure, router} from '@trpc';

const sppbOutRouters = router({
	get: procedure.query(() => {
		return genInvoice(OrmCustomerSPPBOut, 'SJ/IMI');
	}),
	upsert: procedure.input(z.string()).mutation(() => {}),
});

export default sppbOutRouters;
