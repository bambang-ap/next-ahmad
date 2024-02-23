import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';

import {tUserUpsert, TUserUpsert, zId} from '@appTypes/app.zod';
import {decimalValue} from '@constants';
import {getLayout} from '@hoc';
import {Fields, useTableFilterComponent} from '@hooks';
import {trpc} from '@utils/trpc';

Stock.getLayout = getLayout;

type FormType = Fields<TUserUpsert>;

export default function Stock() {
	const {control, reset} = useForm<FormType>({
		resolver: zodResolver(tUserUpsert.or(zId)),
	});

	const {component} = useTableFilterComponent({
		reset,
		control,
		header: [
			'No',
			'Nama',
			'Kode Item',
			'Qty1 Masuk',
			'Qty1 Out',
			'Qty2 Masuk',
			'Qty2 Out',
			'Qty3 Masuk',
			'Qty3 Out',
		],
		useQuery: form => trpc.stock.get.useQuery(form),
		renderItem({Cell, item}, i) {
			const {
				name,
				kode_item,
				inQty1,
				outQty1,
				inQty2,
				outQty2,
				inQty3,
				outQty3,
			} = item;

			return (
				<>
					<Cell>{i + 1}</Cell>
					<Cell>{name}</Cell>
					<Cell>{kode_item}</Cell>
					<Cell>
						{parseFloat(inQty1?.toString() ?? '0').toFixed(decimalValue)}
					</Cell>
					<Cell>
						{parseFloat(outQty1?.toString() ?? '0').toFixed(decimalValue)}
					</Cell>
					<Cell>
						{parseFloat(inQty2?.toString() ?? '0').toFixed(decimalValue)}
					</Cell>
					<Cell>
						{parseFloat(outQty2?.toString() ?? '0').toFixed(decimalValue)}
					</Cell>
					<Cell>
						{parseFloat(inQty3?.toString() ?? '0').toFixed(decimalValue)}
					</Cell>
					<Cell>
						{parseFloat(outQty3?.toString() ?? '0').toFixed(decimalValue)}
					</Cell>
				</>
			);
		},
	});

	return <>{component}</>;
}
