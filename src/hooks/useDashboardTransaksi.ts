import type {RetTotal} from '@trpc/routers/internal/dashboard';

export function useDashboardTransaksi(queries: RetTotal[]) {
	const series = queries.reduce<Record<string, ApexAxisChartSeries[number]>>(
		(ret, cur, i) => {
			entries(cur).forEach(([name, {value}]) => {
				if (!ret[name]) ret[name] = {data: [], name};

				ret[name]!.data[i] = value;
			});

			return ret;
		},
		{},
	);

	return Object.values(series);
}
