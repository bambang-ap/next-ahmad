import {z} from 'zod';

import {tCustomerSPPBIn, uSPPB} from '@appTypes/app.zod';
import {checkCredentialV2, generateId, MAPPING_CRUD_ORM} from '@server';
import {procedure, router} from '@trpc';

const sppbRouters = router({
	upsert: procedure
		.input(
			z.object({
				target: uSPPB,
				data: tCustomerSPPBIn,
			}),
		)
		.mutation(({ctx: {req, res}, input: {data, target}}) => {
			return checkCredentialV2(req, res, () => {
				const {id, ...rest} = data;
				const orm = MAPPING_CRUD_ORM[target];
				return orm.upsert({...rest, id: id || generateId()});
			});
		}),
	delete: procedure
		.input(
			tCustomerSPPBIn.pick({id: true}).extend({
				target: uSPPB,
			}),
		)
		.mutation(({ctx: {req, res}, input: {id, target}}) => {
			return checkCredentialV2(req, res, () => {
				const orm = MAPPING_CRUD_ORM[target];
				return orm.destroy({where: {id}});
			});
		}),
});

export default sppbRouters;
