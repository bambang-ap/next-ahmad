import {RouterOutput} from '@appTypes/app.type';
import {UseTRPCQueryResult} from '@trpc/react-query/shared';

export function useDashboardTransaksi(
	queries: UseTRPCQueryResult<
		RouterOutput['internal']['dashboard']['total'],
		any
	>[],
) {
	const series = queries.reduce<Record<string, ApexAxisChartSeries[number]>>(
		(ret, cur, i) => {
			entries(cur.data).forEach(([name, {value}]) => {
				if (!ret[name]) ret[name] = {data: [], name};

				ret[name]!.data[i] = value;
			});

			return ret;
		},
		{},
	);

	return Object.values(series);
}
