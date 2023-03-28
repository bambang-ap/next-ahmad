import {TDataScan} from '@appTypes/app.type';
import {tScanTarget, zId} from '@appTypes/app.zod';
import {OrmScan} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {appRouter} from '@trpc/routers';
import {TRPCError} from '@trpc/server';

const scanRouters = router({
	get get() {
		return procedure
			.input(zId)
			.query(async ({input: {id}, ctx: {req, res}}) => {
				return checkCredentialV2(
					req,
					res,
					async (): Promise<TDataScan | null> => {
						const routerCaller = appRouter.createCaller({req, res});
						const dataKanban = await routerCaller.kanban.get({
							type: 'kanban',
							where: {id},
						});

						const dataScan = await OrmScan.findOne({
							where: {id_kanban: id},
						});

						if (dataScan) return {...dataScan?.dataValues, dataKanban};

						return null;
					},
				);
			});
	},

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

					const dataScan = await routerCaller.scan.get({id});

					if (!dataScan) {
						throw new TRPCError({
							code: 'BAD_REQUEST',
							message: 'Failed to get dataScan',
						});
					}

					function enabled() {
						switch (target) {
							case 'qc':
								return dataScan?.status_produksi;
							case 'finish_good':
								return dataScan?.status_qc;
							case 'out_barang':
								return dataScan?.status_finish_good;
							default:
								return true;
						}
					}

					if (!enabled()) {
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
