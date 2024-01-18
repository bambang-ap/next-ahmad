import objectPath from 'object-path';
import {FieldPath, useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {Input} from '@baseComps/Input';
import {ButtonGroup} from '@baseComps/Input/ButtonGroup';
import {SelectPropsData} from '@baseComps/Input/Select';
import {Button} from '@baseComps/Touchable/Button';
import {DiscType} from '@enum';

const btnData: SelectPropsData<DiscType>[] = [
	{value: DiscType.Percentage},
	{value: DiscType.Value, label: '123'},
];

type Props<T extends {}> = FormProps<T, 'control' | 'resetField'> &
	Record<'type' | 'discount', FieldPath<T>> & {vertical?: boolean};

export function DiscountSelection<T extends {}>(props: Props<T>) {
	const {control, resetField, type, discount, vertical} = props;

	const dataForm = useWatch({control});

	const typeValue = objectPath.get(dataForm, type);

	const discountEnabled = !!typeValue;
	const isPercentage = typeValue === DiscType.Percentage;

	const clearButton = (
		<Button
			icon="faClose"
			onClick={() => {
				resetField(type);
				resetField(discount);
			}}
		/>
	);

	return (
		<>
			<ButtonGroup
				className="w-full"
				label="Diskon"
				data={btnData}
				fieldName={type}
				control={control}
				vertical={vertical}
			/>

			{discountEnabled && (
				<Input
					label="Diskon"
					type="decimal"
					control={control}
					fieldName={discount}
					rightAcc={
						isPercentage ? (
							<>
								<div className="mr-2">%</div>
								{clearButton}
							</>
						) : (
							clearButton
						)
					}
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
