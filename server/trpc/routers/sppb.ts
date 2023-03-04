import {z} from 'zod';

import {tCustomerSPPBIn, uSPPB} from '@appTypes/app.zod';
import {checkCredentialV2, generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure, router} from '@trpc';

const sppbRouters = router({
	insert: procedure
		.input(
			z.object({
				target: uSPPB,
				data: tCustomerSPPBIn.omit({id: true}),
			}),
		)
		.mutation(({ctx: {req, res}, input: {data, target}}) => {
			return checkCredentialV2(req, res, () => {
				const orm = MAPPING_CRUD_ORM[target];
				return orm.create({...data, id: generateId()});
			});
		}),
});

export default sppbRouters;
