import {z} from 'zod';

import {KanbanGetRow} from '@appTypes/app.type';
import {TScan} from '@appTypes/app.zod';
import {OrmCustomerSPPBOut, OrmScan} from '@database';
import {checkCredentialV2, genInvoice} from '@server';
import {procedure, router} from '@trpc';

import {appRouter} from '..';

const sppbOutRouters = router({
	getInvoice: procedure.query(() => {
		return genInvoice(OrmCustomerSPPBOut, 'SJ/IMI');
	}),
	getFg: procedure.query(({ctx: {req, res}}) => {
		const routerCaller = appRouter.createCaller({req, res});

		return checkCredentialV2(
			req,
			res,
			async (): Promise<(TScan & {kanban: KanbanGetRow})[]> => {
				const dataScan = await OrmScan.findAll({
					where: {status_finish_good: true},
				});

				const dataScanPromise = dataScan.map(async ({dataValues}) => {
					const [kanban] = await routerCaller.kanban.get({
						type: 'kanban',
						where: {id: dataValues.id_kanban},
					});

					return {...dataValues, kanban: {...kanban!}};
				});

				return Promise.all(dataScanPromise);
			},
		);
	}),
	upsert: procedure.input(z.string()).mutation(() => {}),
});

export default sppbOutRouters;
