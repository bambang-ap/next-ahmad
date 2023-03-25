import {Control} from 'react-hook-form';

import {Input, Select} from '@components';
import {ColUnion} from '@constants';

type RenderFieldProps = {control: Control; item: ColUnion};

export function RenderField(props: RenderFieldProps) {
	const {control, item} = props;
	const {col, label} = item;

	if (item.type === 'select') {
		const query = item.dataQuery();

		return (
			<Select
				control={control}
				fieldName={col}
				firstOption={item.firstOption}
				data={item.dataMapping(query.data) ?? []}
			/>
		);
	}

	return (
		<Input
			type={item.type}
			label={label}
			control={control}
			fieldName={col}
			placeholder={col}
		/>
	);
}
