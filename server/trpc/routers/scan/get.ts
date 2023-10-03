import {Includeable} from "sequelize";

import {tRoute, TScanTarget, zId} from "@appTypes/app.zod";
import {getScanAttributesV2, OrmKanban, OrmScanNew} from "@database";
import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";
import {TRPCError} from "@trpc/server";
import {scanRouterParser} from "@utils";

import type {ScanGetV2} from "./";

export const getScan = {
	getV3: procedure.input(zId.extend(tRoute.shape)).query(({ctx, input}) => {
		const {id, route} = input;

		const {
			scn,
			knb,
			scItem,
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

		const includeAble: Includeable = {
			attributes: knb.keys,
			include: [
				{
					model: user.orm,
					as: OrmKanban._aliasCreatedBy,
					attributes: user.keys,
				},
				{
					model: bin.orm,
					attributes: bin.keys,
					include: [
						{
							model: po.orm,
							attributes: po.keys,
							include: [{model: cust.orm, attributes: cust.keys}],
						},
					],
				},
				{
					separate: true,
					attributes: knbItem.keys,
					model: knbItem.orm,
					include: [
						{model: mItem.orm, attributes: mItem.keys},
						{
							model: binItem.orm,
							attributes: binItem.keys,
							include: [{model: poItem.orm, attributes: poItem.keys}],
						},
					],
				},
			],
		};

		function asdd(status: TScanTarget) {
			return scn.orm.findOne({
				attributes: scn.keys,
				where: {id_kanban: id, status},
				include: [
					Object.assign(includeAble, {model: knb.orm}),
					{
						model: scItem.orm,
						attributes: scItem.keys,
						include: [{model: sciReject.orm, attributes: sciReject.keys}],
					},
				],
			});
		}

		return checkCredentialV2(ctx, async (): Promise<ScanGetV2> => {
			const {isFG, isProduksi, isQC} = scanRouterParser(route);
			const status: TScanTarget = isQC ? "produksi" : isFG ? "qc" : route;

			const count = await OrmScanNew.count({
				where: {status, id_kanban: id},
				include: [
					{
						model: scItem.orm,
						attributes: scItem.keys,
						include: [{model: sciReject.orm, attributes: sciReject.keys}],
					},
				],
			});

			if (!isProduksi && count <= 0) {
				throw new TRPCError({code: "NOT_FOUND"});
			}

			const data = await asdd(route);

			if (!data) {
				const prevData = await asdd(
					route === "qc" ? "produksi" : route === "finish_good" ? "qc" : route,
				);

				if (prevData) {
					return {
						...prevData.dataValues,
						id: undefined,
					} as unknown as ScanGetV2;
				}

				const kanban = await knb.orm.findOne({where: {id}, ...includeAble});

				return {
					OrmKanban: kanban?.dataValues as unknown as ScanGetV2["OrmKanban"],
				};
			}

			return data.dataValues as unknown as ScanGetV2;
		});
	}),
};
