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
		header: ['No', 'Nama', 'Kode Item', 'BOX/PALET/DRUM', 'PCS', 'KG'],
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
					<Cell width="15%">{calculate(inQty1, outQty1)}</Cell>
					<Cell width="15%">{calculate(inQty2, outQty2)}</Cell>
					<Cell width="15%">{calculate(inQty3, outQty3)}</Cell>
				</>
			);
		},
	});

	function calculate(inQty: number | null, outQty: number | null) {
		const qtyIn = Math.add(0, inQty!).toFixed(decimalValue);
		const qtyOut = Math.add(0, outQty!).toFixed(decimalValue);
		const stock = Math.subtract(inQty!, outQty!).toFixed(decimalValue);

		return (
			<div className="flex-1 flex flex-col">
				<div className="flex justify-between">
					<div>Masuk</div>
					<div>{qtyIn}</div>
				</div>
				<div className="flex justify-between">
					<div>Keluar</div>
					<div>{qtyOut}</div>
				</div>
				<div className="flex justify-between">
					<div>Stock</div>
					<div>{stock}</div>
				</div>
			</div>
		);
	}

	return <>{component}</>;
}
