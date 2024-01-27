import {useEffect} from 'react';

import objectPath from 'object-path';
import {FieldPath, FieldValues, useWatch} from 'react-hook-form';

import {FormProps} from '@appTypes/app.type';
import {Input, InputDummy} from '@baseComps/Input';
import {ButtonGroup} from '@baseComps/Input/ButtonGroup';
import {SelectPropsData} from '@baseComps/Input/Select';
import {Cells} from '@baseComps/Table';
import {Button} from '@baseComps/Touchable/Button';
import {DiscType} from '@enum';

const btnData: SelectPropsData<DiscType>[] = [
	{value: DiscType.Percentage},
	{value: DiscType.Value, label: '123'},
];

type RProps<T extends FieldValues> = FormProps<T, 'control' | 'setValue'> & {
	type: [source: DiscType, targetPath: FieldPath<T>];
	discount: [source: number, targetPath: FieldPath<T>];
	qtyPrice: [qtyPath: FieldPath<T>, price: number];
	length?: number;
};

export function getDiscValue(
	discType?: DiscType | null,
	discVal?: number | null,
	total?: number | null,
	length = 1,
) {
	const disc = discVal ?? 0;
	const tot = total ?? 0;

	const discValue =
		discType === DiscType.Percentage
			? disc * tot * 0.01
			: discType === DiscType.Value
			? length
			: 0;

	return {discValue, totalPrice: tot - discValue};
}

export function DiscountRenderer<T extends FieldValues>({
	type,
	control,
	setValue,
	discount,
	length = 1,
	qtyPrice,
}: RProps<T>) {
	const [typeSource, typeTargetName] = type;
	const [discSource, discTargetName] = discount;
	const [qtyPath, price] = qtyPrice;

	const obj = useWatch({control});

	const qty = objectPath.get<number>(obj, qtyPath, 0);
	const discType = objectPath.get<DiscType | null>(obj, typeTargetName, null);
	const discVal = objectPath.get<number>(obj, discTargetName, 0);

	const total = qty * price;

	const {discValue, totalPrice} = getDiscValue(
		discType,
		discVal,
		total,
		discVal / length,
	);

	useEffect(() => {
		// @ts-ignore
		setValue(typeTargetName, typeSource);
		// @ts-ignore
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
				key={totalPrice}
				byPassValue={totalPrice}
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

export function RenderTotalHarga<T>({
	items,
	Cell,
	colSpan,
	calculate,
}: {
	items: T[];
	colSpan: number;
	calculate: (item: T, index: number) => number;
} & Cells) {
	const priceTotal = items.reduce(
		(total, item, index) => total + calculate(item, index),
		0,
	);

	return (
		<>
			<Cell colSpan={colSpan} />
			<Cell>
				<InputDummy
					disabled
					className="flex-1"
					byPassValue={priceTotal}
					label="Total Harga"
				/>
			</Cell>
		</>
	);
}
