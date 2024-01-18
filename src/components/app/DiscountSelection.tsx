import objectPath from 'object-path';
import {Path, useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {Input} from '@baseComps/Input';
import {ButtonGroup} from '@baseComps/Input/ButtonGroup';
import {SelectPropsData} from '@baseComps/Input/Select';
import {DiscType} from '@enum';

const btnData: SelectPropsData<DiscType>[] = [
	{value: DiscType.Percentage, label: 'Persentase'},
	{value: DiscType.Value, label: 'Nilai'},
];

type Props<T extends {}> = FormProps<T> & Record<'type' | 'discount', Path<T>>;

export function DiscountSelection<T extends {}>(props: Props<T>) {
	const {control, type, discount} = props;

	const dataForm = useWatch({control});

	const typeValue = objectPath.get(dataForm, type);

	const discountEnabled = !!typeValue;
	const isPercentage = typeValue === DiscType.Percentage;

	return (
		<>
			<ButtonGroup
				clearable
				label="Diskon"
				control={control}
				fieldName={type}
				data={btnData}
			/>
			{discountEnabled && (
				<Input
					type="decimal"
					control={control}
					fieldName={discount}
					rightAcc={isPercentage ? <div>%</div> : undefined}
					rules={
						!isPercentage
							? undefined
							: {
									max: {value: 100, message: 'Max value is 100'},
									min: {value: 0, message: 'Min value is 0'},
							  }
					}
				/>
			)}
		</>
	);
}
