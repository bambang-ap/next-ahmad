import {TDataScan} from '@appTypes/app.type';
import {TScanTarget, tScanTarget, zId} from '@appTypes/app.zod';
import {OrmScan} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {appRouter} from '@trpc/routers';
import {TRPCError} from '@trpc/server';

function enabled(target: TScanTarget, dataScan?: TDataScan) {
	switch (target) {
		case 'produksi':
			return true;
		case 'qc':
			return dataScan?.status_produksi;
		case 'finish_good':
			return dataScan?.status_qc;
		// case 'out_barang':
		// 	return dataScan?.status_finish_good;
		default:
			return false;
	}
}

const scanRouters = router({
	get: procedure
		.input(zId.extend({target: tScanTarget}))
		.query(async ({input: {id, target}, ctx: {req, res}}) => {
			return checkCredentialV2(
				req,
				res,
				async (): Promise<TDataScan | null> => {
					const routerCaller = appRouter.createCaller({req, res});
					const dataKanban = await routerCaller.kanban.get({
						type: 'kanban',
						where: {id},
					});

					console.log(dataKanban);

					const dataScan = await OrmScan.findOne({
						where: {id_kanban: id},
					});

					if (dataScan) {
						const dataScann = {...dataScan?.dataValues, dataKanban};
						// @ts-ignore
						if (!enabled(target, dataScann))
							throw new TRPCError({code: 'NOT_FOUND', message: 'dhjfdfhj'});

						// @ts-ignore
						return dataScann;
					}

					return null;
				},
			);
		}),

	update: procedure
		.input(zId.extend({target: tScanTarget}))
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2(
				req,
				res,
				async (): Promise<{message: string}> => {
					const routerCaller = appRouter.createCaller({req, res});

					const {id, target} = input;
					const statusTarget = `status_${target}` as const;

					const dataScan = await routerCaller.scan.get({id, target});

					if (!dataScan) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Failed to get dataScan',
						});
					}

					if (!enabled(target, dataScan)) {
						throw new TRPCError({code: 'BAD_REQUEST', message: 'Failed'});
					}

					await OrmScan.update(
						{[statusTarget]: true},
						{where: {id_kanban: id}},
					);

					return {message: 'Success'};
				},
			);
		}),
});

export default scanRouters;
