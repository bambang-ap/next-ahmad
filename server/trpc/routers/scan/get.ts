import {Includeable} from "sequelize";

import {tRoute, TScanTarget, zId} from "@appTypes/app.zod";
import {dScan, getScanAttributesV2, OrmKanban} from "@database";
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
			attributes: knb.attributes,
			include: [
				{
					model: user.model,
					as: OrmKanban._aliasCreatedBy,
					attributes: user.attributes,
				},
				{
					model: bin.model,
					attributes: bin.attributes,
					include: [
						{
							model: po.model,
							attributes: po.attributes,
							include: [{model: cust.model, attributes: cust.attributes}],
						},
					],
				},
				{
					separate: true,
					attributes: knbItem.attributes,
					model: knbItem.model,
					include: [
						{model: mItem.model, attributes: mItem.attributes},
						{
							model: binItem.model,
							attributes: binItem.attributes,
							include: [{model: poItem.model, attributes: poItem.attributes}],
						},
					],
				},
			],
		};

		function asdd(status: TScanTarget) {
			return scn.model.findOne({
				attributes: scn.attributes,
				where: {id_kanban: id, status},
				include: [
					Object.assign(includeAble, {model: knb.model}),
					{
						model: scItem.model,
						attributes: scItem.attributes,
						include: [
							{model: sciReject.model, attributes: sciReject.attributes},
						],
					},
				],
			});
		}

		return checkCredentialV2(ctx, async (): Promise<ScanGetV2> => {
			const {isFG, isProduksi, isQC} = scanRouterParser(route);
			const status: TScanTarget = isQC ? "produksi" : isFG ? "qc" : route;

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

				const kanban = await knb.model.findOne({where: {id}, ...includeAble});

				return {
					OrmKanban: kanban?.dataValues as unknown as ScanGetV2["OrmKanban"],
				};
			}

			return data.dataValues as unknown as ScanGetV2;
		});
	}),
};
