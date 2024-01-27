import {useEffect} from 'react';

import objectPath from 'object-path';
import {FieldPath, FieldValues, useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {Input, InputDummy} from '@baseComps/Input';
import {ButtonGroup} from '@baseComps/Input/ButtonGroup';
import {SelectPropsData} from '@baseComps/Input/Select';
import {Button} from '@baseComps/Touchable/Button';
import {DiscType} from '@enum';

const btnData: SelectPropsData<DiscType>[] = [
	{value: DiscType.Percentage},
	{value: DiscType.Value, label: '123'},
];

type RProps<T extends FieldValues> = FormProps<T, 'control' | 'setValue'> & {
	type: [source: FieldPath<T>, target: FieldPath<T>];
	discount: [source: FieldPath<T>, target: FieldPath<T>];
	qtyPrice: [qty: FieldPath<T>, price: FieldPath<T>];
	length: number;
};

export function DiscountRenderer<T extends FieldValues>({
	type,
	control,
	setValue,
	discount,
	length,
	qtyPrice,
}: RProps<T>) {
	const [a, typeTargetName] = type;
	const [b, discTargetName] = discount;
	const [qty, price] = qtyPrice;
	const [typeSource, discSource, discType, discVal = 0, qtyy = 0, pricee = 0] =
		useWatch({
			control,
			name: [a, b, typeTargetName, discTargetName, qty, price],
		});

	const total = qtyy * pricee;

	const discValue =
		discType === DiscType.Percentage
			? discVal * total * 0.01
			: discType === DiscType.Value
			? discVal / length
			: 0;

	useEffect(() => {
		setValue(typeTargetName, typeSource);
		setValue(discTargetName, discSource);
	}, [typeSource, discSource]);

	return (
		<>
			<Input hidden control={control} fieldName={discTargetName} />
			<Input hidden control={control} fieldName={typeTargetName} />
			{!!discValue && (
				<InputDummy disabled label="Diskon" byPassValue={discValue} />
			)}
			<InputDummy
				disabled
				label="Total"
				key={total - discValue}
				byPassValue={total - discValue}
			/>
		</>
	);
}

type Props<T extends FieldValues> = FormProps<T, 'control' | 'setValue'> &
	Record<'type' | 'discount', FieldPath<T>> & {
		vertical?: boolean;
		className?: string;
	};

export function DiscountSelection<T extends FieldValues>(props: Props<T>) {
	const {
		control,
		setValue,
		type,
		discount,
		vertical,
		className = 'w-full',
	} = props;

	const dataForm = useWatch({control});

	const typeValue = objectPath.get(dataForm, type);

	const discountEnabled = !!typeValue;
	const isPercentage = typeValue === DiscType.Percentage;

	const clearButton = discountEnabled && (
		<Button
			icon="faClose"
			onClick={() => {
				// @ts-ignore
				setValue(type, null);
				// @ts-ignore
				setValue(discount, null);
			}}
		/>
	);

	const leftAcc = (
		<ButtonGroup
			className={classNames('mr-2', className)}
			data={btnData}
			fieldName={type}
			control={control}
			vertical={vertical}
		/>
	);

	const rightAcc = (
		<div className="flex gap-2 ml-2 items-center">
			{isPercentage ? (
				<>
					<div>%</div>
					{clearButton}
				</>
			) : (
				clearButton
			)}
		</div>
	);

	return (
		<>
			<Input
				leftAcc={leftAcc}
				rightAcc={rightAcc}
				className="flex-1"
				label="Diskon"
				disabled={!discountEnabled}
				type="decimal"
				control={control}
				fieldName={discount}
				rules={{
					min: {value: 0, message: 'Min value is 0'},
					max: {
						message: 'Max value is 100',
						value: isPercentage ? 100 : Infinity,
					},
				}}
			/>
		</>
	);
}
