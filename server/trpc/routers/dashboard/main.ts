import {col, FindOptions, fn} from 'sequelize';
import {z} from 'zod';

import {TDecimal, TItemUnit, UQty} from '@appTypes/app.type';
import {tDateFilter, tScanItemReject, tScanNew} from '@appTypes/app.zod';
import {allowedUnit as unitData} from '@constants';
import {
	attrParserV2,
	dInItem,
	dKnbItem,
	dPoItem,
	dRejItem,
	dScan,
	dScanItem,
	groupPages,
	OrmCustomerPOItem,
	OrmCustomerSPPBOutItem,
	OrmKanbanItem,
	OrmPOItemSppbIn,
	whereDateFilter,
	wherePagesV3,
} from '@database';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';
import {qtyMap} from '@utils';

export type U = {unit: TItemUnit; qty: TDecimal};
export type J = Record<UQty, U[]>;

type TInput = z.infer<typeof tInput>;
const tInput = tDateFilter.partial();

export default function mainDashboardRouter() {
	type TScanInput = z.infer<typeof tScanInput>;
	const tScanInput = tInput.extend(tScanNew.pick({status: true}).shape);

	type TRejInput = z.infer<typeof tRejInput>;
	const tRejInput = tInput.extend(tScanItemReject.pick({reason: true}).shape);

	function dashPo(input: TInput) {
		function selector(num: UQty): FindOptions {
			const uu = `unit${num}`;

			return {
				group: [uu],
				where: {[uu]: unitData, ...whereDateFilter('$createdAt$', input)},
				attributes: [
					[uu, 'unit'],
					[fn('sum', col(`qty${num}`)), 'qty'],
				],
			};
		}

		const queries = [
			OrmCustomerPOItem.findAll(selector(1)),
			OrmCustomerPOItem.findAll(selector(2)),
			OrmCustomerPOItem.findAll(selector(3)),
		];

		return parseQueries(queries);
	}

	function dashSppbIn(input: TInput) {
		function selector(num: UQty): FindOptions {
			const group = `OrmCustomerPOItem.unit${num}`;
			return {
				group,
				raw: true,
				include: [{model: OrmCustomerPOItem, attributes: []}],
				where: {
					[`$${group}$`]: unitData,
					...whereDateFilter('$OrmPOItemSppbIn.createdAt$', input),
				},
				attributes: [
					[col(group), 'unit'],
					[fn('sum', col(`OrmPOItemSppbIn.qty${num}`)), 'qty'],
				],
			};
		}

		const queries = [
			OrmPOItemSppbIn.findAll(selector(1)),
			OrmPOItemSppbIn.findAll(selector(2)),
			OrmPOItemSppbIn.findAll(selector(3)),
		];

		return parseQueries(queries);
	}

	function dashKanban(input: TInput) {
		function selector(num: UQty): FindOptions {
			const group = `OrmPOItemSppbIn.OrmCustomerPOItem.unit${num}`;
			return {
				group,
				raw: true,
				where: {
					[`$${group}$`]: unitData,
					...whereDateFilter('$OrmKanbanItem.createdAt$', input),
				},
				include: [
					{
						attributes: [],
						model: OrmPOItemSppbIn,
						include: [{model: OrmCustomerPOItem, attributes: []}],
					},
				],
				attributes: [
					[col(group), 'unit'],
					[fn('sum', col(`OrmKanbanItem.qty${num}`)), 'qty'],
				],
			};
		}

		const queries = [
			OrmKanbanItem.findAll(selector(1)),
			OrmKanbanItem.findAll(selector(2)),
			OrmKanbanItem.findAll(selector(3)),
		];

		return parseQueries(queries);
	}

	function dashScan(input: TScanInput) {
		const {status: target} = input;

		async function selector(num: UQty) {
			type Ret = typeof scnItem.obj & {
				dScan: typeof scn.obj;
				dKnbItem: typeof knbItem.obj & {
					dInItem: typeof inItem.obj & {
						dPoItem: typeof poItem.obj;
					};
				};
			};

			const {inItem, knbItem, poItem, scn, scnItem} = getAttributes();

			const group = groupPages<Ret>(`dKnbItem.dInItem.dPoItem.unit${num}`);
			const data = scnItem.model.findAll({
				group,
				where: {
					...wherePagesV3<Ret>({'$dScan.status$': target}),
					...whereDateFilter('$dScanItem.createdAt$', input),
					[`$${group}$`]: unitData,
				},
				attributes: [
					[col(group), 'unit'],
					[fn('sum', col(`dScanItem.qty${num}`)), 'qty'],
				],
				include: [
					{model: scn.model, attributes: []},
					{
						model: knbItem.model,
						attributes: [],
						include: [
							{
								model: inItem.model,
								attributes: [],
								include: [{model: poItem.model, attributes: []}],
							},
						],
					},
				],
			});

			return data;
		}

		const queries = [selector(1), selector(2), selector(3)];

		return parseQueries(queries);
	}

	function dashRej(input: TRejInput) {
		const {reason: target} = input;

		async function selector(num: UQty) {
			type Ret = typeof rejItem.obj & {
				dScanItem: typeof scnItem.obj & {
					dKnbItem: typeof knbItem.obj & {
						dInItem: typeof inItem.obj & {
							dPoItem: typeof poItem.obj;
						};
					};
				};
			};

			const {rejItem, inItem, knbItem, poItem, scnItem} = getAttributes();

			const group = groupPages<Ret>(
				`dScanItem.dKnbItem.dInItem.dPoItem.unit${num}`,
			);
			const data = rejItem.model.findAll({
				group,
				where: {
					...wherePagesV3<Ret>({reason: target}),
					...whereDateFilter('$dRejItem.createdAt$', input),
					[`$${group}$`]: unitData,
				},
				attributes: [
					[col(group), 'unit'],
					[fn('sum', col(`dRejItem.qty${num}`)), 'qty'],
				],
				include: [
					{
						model: scnItem.model,
						attributes: [],
						include: [
							{
								model: knbItem.model,
								attributes: [],
								include: [
									{
										model: inItem.model,
										attributes: [],
										include: [{model: poItem.model, attributes: []}],
									},
								],
							},
						],
					},
				],
			});

			return data;
		}

		const queries = [selector(1), selector(2), selector(3)];

		return parseQueries(queries);
	}

	return router({
		po: procedure.input(tInput).query(({input, ctx}) => {
			return checkCredentialV2(ctx, () => dashPo(input));
		}),
		sppbIn: procedure.input(tInput).query(({input, ctx}) => {
			return checkCredentialV2(ctx, () => dashSppbIn(input));
		}),
		kanban: procedure.input(tInput).query(({input, ctx}) => {
			return checkCredentialV2(ctx, () => dashKanban(input));
		}),
		sppbOut: procedure.input(tInput).query(({input, ctx}) => {
			return checkCredentialV2(ctx, () => dashSppbOut(input));
		}),
		scan: procedure.input(tScanInput).query(({ctx, input}) => {
			return checkCredentialV2(ctx, () => dashScan(input));
		}),
		reject: procedure.input(tRejInput).query(({ctx, input}) => {
			return checkCredentialV2(ctx, () => dashRej(input));
		}),
	});
}

export function dashSppbOut(input: TInput) {
	function selector(num: UQty): FindOptions {
		const group = `OrmPOItemSppbIn.OrmCustomerPOItem.unit${num}`;
		return {
			group,
			raw: true,
			where: {
				[`$${group}$`]: unitData,
				...whereDateFilter('$OrmCustomerSPPBOutItem.createdAt$', input),
			},
			include: [
				{
					attributes: [],
					model: OrmPOItemSppbIn,
					include: [{model: OrmCustomerPOItem, attributes: []}],
				},
			],
			attributes: [
				[col(group), 'unit'],
				[fn('sum', col(`OrmCustomerSPPBOutItem.qty${num}`)), 'qty'],
			],
		};
	}

	const queries = [
		OrmCustomerSPPBOutItem.findAll(selector(1)),
		OrmCustomerSPPBOutItem.findAll(selector(2)),
		OrmCustomerSPPBOutItem.findAll(selector(3)),
	];

	return parseQueries(queries);
}

function getAttributes() {
	const rejItem = attrParserV2(dRejItem);
	const scnItem = attrParserV2(dScanItem);
	const scn = attrParserV2(dScan);
	const knbItem = attrParserV2(dKnbItem);
	const inItem = attrParserV2(dInItem);
	const poItem = attrParserV2(dPoItem);

	return {rejItem, scnItem, scn, knbItem, inItem, poItem};
}

async function parseQueries(queries: Promise<any>[]) {
	const result = await Promise.all(queries);
	const numData = qtyMap(({num}, i) => {
		const data = result[i]! as U;
		return {[num]: data};
	});
	// @ts-ignore
	return numData.reduce((a, b) => ({...a, ...b})) as J;
}
