import {TScanTarget, zIds} from '@appTypes/app.zod';
import {
	getPrintPoAttributes,
	printSppbOutAttributes,
	wherePagesV3,
} from '@database';
import {getSJInGrade, poCustomerSjGrade} from '@db/getSjGrade';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

import {printKanbanRouter} from './kanban';
import {printScanRouter} from './scan';

export type SppbOutGet = ReturnType<typeof printSppbOutAttributes>['Ret'];

const printRouters = router({
	...printKanbanRouter,
	...printScanRouter,
	sppb: router({
		out: procedure.input(zIds).query(({ctx, input}) => {
			type RetExport = typeof Ret;
			const {
				sjOut,
				vehicle,
				customer,
				outItem,
				inItem,
				item,
				poItem,
				po,
				sjInInclude,
				Ret,
				tIndex,
			} = printSppbOutAttributes();

			return checkCredentialV2(ctx, async (): Promise<SppbOutGet[]> => {
				const data = await sjOut.model.findAll({
					logging: true,
					where: wherePagesV3<typeof Ret>({
						id: input.ids,
						'$dOutItems.dInItem.dSJIn.dKanbans.dScans.status$':
							'finish_good' as TScanTarget,
					}),
					attributes: sjOut.attributes,
					include: [
						tIndex,
						vehicle,
						customer,
						{
							...outItem,
							include: [
								{
									...inItem,
									include: [item, sjInInclude, {...poItem, include: [po]}],
								},
							],
						},
					],
				});

				return data.map(e => e.toJSON() as unknown as RetExport);
			});
		}),
	}),
	po: procedure.input(zIds).query(({ctx, input}) => {
		type RetOutput = typeof Ret;

		const {Ret, Po, Scan, ScanItem, RetScnItem, poIncludeAble} =
			getPrintPoAttributes();

		return checkCredentialV2(ctx, async (): Promise<RetOutput[]> => {
			const dataPO = await Po.model.findAll({
				raw: true,
				nest: true,
				where: {id: input.ids},
				attributes: Po.attributes,
				include: poIncludeAble,
			});

			const id_po = dataPO.map(e => (e as unknown as RetOutput).id);

			const sjGrades = await getSJInGrade({id_po});

			const promisedData = dataPO.map(async data => {
				const val = data as unknown as RetOutput;
				const {dPoItems} = val;
				const {dInItems} = dPoItems;
				const {dKnbItems} = dInItems ?? {};

				const id_kanban_item = dKnbItems?.id;

				if (!id_kanban_item) return val;

				const dataScanItem = await ScanItem.model.findAll({
					include: [Scan],
					where: {id_kanban_item},
				});

				const ret: RetOutput = {
					...val,
					grade: poCustomerSjGrade(val.id, sjGrades),
					dPoItems: {
						...dPoItems,
						dInItems: {
							...dInItems!,
							dKnbItems: {
								...dKnbItems,
								dScanItems: dataScanItem.map(
									e => e.toJSON() as unknown as typeof RetScnItem,
								),
							},
						},
					},
				};

				return ret;
			});

			return Promise.all(promisedData);
		});
	}),
});

export default printRouters;
