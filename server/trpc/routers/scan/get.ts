import {Includeable} from 'sequelize';

import {tRoute, TScanTarget, zId} from '@appTypes/app.zod';
import {dScan, getScanAttributesV2, OrmKanban} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';
import {TRPCError} from '@trpc/server';
import {scanRouterParser} from '@utils';

import type {ScanGetV2} from './';
import scanDevOnly from './devOnly';

export function getScan() {
	return {
		devOnly: scanDevOnly(),
		getV3: procedure.input(zId.extend(tRoute.shape)).query(({ctx, input}) => {
			const {id, route} = input;

			const {
				scn,
				scnId,
				knb,
				scItem,
				scItemId,
				knbItem,
				user,
				bin,
				binItem,
				cust,
				sciReject,
				mItem,
				po,
				poItem,
			} = getScanAttributesV2();

			const kanbanIncludeAble: Includeable = {
				attributes: knb.attributes,
				include: [
					{as: OrmKanban._aliasCreatedBy, ...user},
					{...bin, include: [{...po, include: [cust]}]},
					{
						...knbItem,
						separate: true,
						include: [mItem, {...binItem, include: [poItem]}],
					},
				],
			};

			function asdd(status: TScanTarget) {
				return scn.model.findOne({
					attributes: scn.attributes,
					where: {id_kanban: id, status},
					include: [
						Object.assign(kanbanIncludeAble, {model: knb.model}),
						{
							...scItem,
							include: [
								{
									...sciReject,
									include: [{...scItemId, include: [scnId]}],
								},
							],
						},
					],
				});
			}

			return checkCredentialV2(ctx, async (): Promise<ScanGetV2> => {
				const {isFG, isProduksi, isQC} = scanRouterParser(route);
				const status: TScanTarget = isQC ? 'produksi' : isFG ? 'qc' : route;

				const count = await dScan.count({
					where: {status, id_kanban: id},
					include: [
						{
							model: scItem.model,
							attributes: scItem.attributes,
							include: [
								{model: sciReject.model, attributes: sciReject.attributes},
							],
						},
					],
				});

				if (!isProduksi && count <= 0) {
					throw new TRPCError({code: 'NOT_FOUND'});
				}

				const data = await asdd(route);

				if (!data) {
					const prevData = await asdd(
						route === 'qc'
							? 'produksi'
							: route === 'finish_good'
							? 'qc'
							: route,
					);

					if (prevData) {
						return {
							...prevData.dataValues,
							id: undefined,
						} as unknown as ScanGetV2;
					}

					const kanban = await knb.model.findOne({
						where: {id},
						...kanbanIncludeAble,
					});

					return {
						dKanban: kanban?.dataValues as unknown as ScanGetV2['dKanban'],
					};
				}

				return data.dataValues as unknown as ScanGetV2;
			});
		}),
	};
}
