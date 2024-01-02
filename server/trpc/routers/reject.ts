import {tableFormValue} from '@appTypes/app.zod';
import {getRejectAttributes, wherePagesV2} from '@database';
import {checkCredentialV2, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export type RejectRetType = ReturnType<typeof getRejectAttributes>['Ret'];

const rejectRouters = router({
	get: procedure.input(tableFormValue).query(({ctx, input}) => {
		const {limit, page, search} = input;

		const {rejScan, scan, kanban, tIndex, scanItem} = getRejectAttributes();

		return checkCredentialV2(ctx, async () => {
			const {count, rows} = await rejScan.model.findAndCountAll({
				limit,
				offset: (page - 1) * limit,
				attributes: rejScan.attributes,
				where: wherePagesV2<RejectRetType>(
					[
						'$dScanItem.dScan.dKanban.index_number$',
						'$dScanItem.dScan.dKanban.nomor_kanban$',
						'$dScanItem.dScan.lot_no_imi$',
						'$dScanItem.dScan.status$',
					],
					search,
				),
				include: [
					{
						...scanItem,
						include: [{...scan, include: [{...kanban, include: [tIndex]}]}],
					},
				],
			});

			const data = rows.map(e => e.toJSON() as unknown as RejectRetType);

			return pagingResult(count, page, limit, data);
		});
	}),
});

export default rejectRouters;
