import {useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {UseDateFilterProps} from '@hooks';
import {trpc} from '@utils/trpc';

export type DashboardForm = UseDateFilterProps<{}>;

export default function DashboardNilai({control}: FormProps<DashboardForm>) {
	const input = useWatch({control});

	trpc.dashboard.sales.nilai.useQuery(input);

	return null;
}
