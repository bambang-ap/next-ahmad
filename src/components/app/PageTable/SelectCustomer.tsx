import {FieldPath} from 'react-hook-form';
import {z} from 'zod';

import {FormProps} from '@appTypes/app.type';
import {tCustomer} from '@appTypes/app.zod';
import {Select, selectMapperV3, SelectProps} from '@components';
import {WrappedProps} from '@formController';

type TDD = z.infer<typeof TD>;
type Props<TT extends {}, T extends TDD> = FormProps<TT> & {
	fieldName: FieldPath<TT>;
	data: T[] | undefined | null;
} & WrappedProps<TT, Omit<SelectProps, 'data' | 'label' | 'firstOption'>>;

const TD = tCustomer.pick({id: true, keterangan: true, name: true});

export function SelectCustomer<TT extends {}, T extends TDD>(
	props: Props<TT, T>,
) {
	const {data, ...rest} = props;

	return (
		<Select
			{...rest}
			label="Customer"
			firstOption="- Pilih Customer -"
			data={selectMapperV3(data ?? [], ({id: value, name, keterangan}) => {
				const label = [name, keterangan].filter(Boolean).join(' - ');

				return {value, label};
			})}
		/>
	);
}
