import {z} from 'zod';

import {tDateFilter} from '@appTypes/app.zod';
import {kanbanGradeAttributes, wherePagesV3} from '@database';
import {getKanbanGrade, RetGrade, RetGradeWhere} from '@db/getGrade';
import {checkCredentialV2} from '@server';
import {procedure, router} from '@trpc';

export default function dashboardGradeRouters() {
	const tFilter = tDateFilter.extend({id_customer: z.string().array()});

	return router({
		kanban: procedure.input(tFilter.partial()).query(({ctx, input}) => {
			type RetKnb = Record<
				string,
				Omit<RetGrade, 'where'> & {
					customer: Omit<typeof cust.obj, 'id'>;
				}
			>;

			const {cust} = kanbanGradeAttributes();

			return checkCredentialV2(ctx, async () => {
				const where =
					input.id_customer?.length! > 0
						? wherePagesV3<RetGradeWhere>({
								'$dKanban.dPo.id_customer$': input.id_customer,
						  })
						: undefined;

				const grades: RetGrade = await getKanbanGrade(where, true);

				const data = grades?.scores.reduce<RetKnb>((ret, item, i) => {
					const {customer: cust, ...cur} = item;
					const {id = '', ...customer} = cust! ?? {};
					if (!ret[id]) ret[id] = {customer, status: [], scores: []};

					ret[id].scores.push(cur);
					ret[id].status.push(grades.status[i]!);
					return ret;
				}, {});

				return data;
			});
		}),
	});
}
