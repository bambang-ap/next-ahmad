import {useContext, useEffect} from 'react';

import {Autocomplete, Box, TextField} from '@mui/material';

import {FormContext} from '@baseComps/Form';
import {Icon} from '@baseComps/Icon';

import {FieldPath, FieldValues} from 'react-hook-form';

import {Text} from '@components';
import {defaultTextFieldProps} from '@constants';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import {useTicker} from '@hooks';
import {classNames} from '@utils';

import {InputComponent} from '..';

export type SelectPropsData<T extends number | string = string> = {
	label?: string;
	value: T;
};

export type SelectProps = {
	firstOption?: string;
	disabled?: boolean;
	data?: SelectPropsData<string | number>[];
	label?: string;
	noLabel?: boolean;
	disableClear?: boolean;
	isLoading?: boolean;
	topSelected?: boolean;
	forceEditable?: boolean;
};

export const Select = withReactFormController(SelectComponent);

export function selectMapperV3<T extends FieldValues>(
	data: T[],
	callback: (item: T) => SelectPropsData | undefined,
): SelectPropsData[] {
	return data.map(e => callback(e)).filter(Boolean);
}

export function selectMapperV2<T extends FieldValues, P extends FieldPath<T>>(
	data: T[],
	value: P,
	opts?: {labels?: P[]; joiner?: string; filter?: boolean},
) {
	const {joiner = ' - ', labels, filter = true} = opts ?? {};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return data.map<SelectPropsData>(_item => {
		function finder(path?: string) {
			if (!path) return undefined;

			return eval(`_item?.${path.replace(/\./g, '?.')}`);
		}

		const labelsMap = labels?.map(label => finder(label));

		return {
			value: finder(value),
			get label() {
				if (!labels) return undefined;

				if (!filter) return labelsMap?.join(joiner);

				return labelsMap?.filter(Boolean).join(joiner);
			},
		};
	});
}

export function selectMapper<
	T extends FieldValues,
	P extends FieldPath<T>,
	PP extends FieldPath<T>,
>(
	data: T[],
	value: P | P[] | [string, P][],
	label: PP | PP[] | [string, PP][],
) {
	type O = P | PP;
	// @ts-ignore
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	return data?.map<SelectDataProps>(item => {
		function finder(path?: string) {
			if (!path) return undefined;

			return eval(`item?.${path.replace(/\./g, '?.')}`);
		}

		function finderY(pathValue: O | O[] | [string, O][]) {
			if (!Array.isArray(pathValue)) return finder(pathValue);
			else {
				return pathValue
					.map(val => {
						if (Array.isArray(val)) {
							const [k, v] = val;
							return `${k} : ${finder(v)}`;
						}

						return finder(val);
					})
					.filter(Boolean)?.[0];
			}
		}

		return {value: finderY(value), label: label ? finderY(label) : undefined};
	});
}

function SelectComponent<F extends FieldValues>({
	data = [],
	disabled,
	controller,
	disableClear,
	firstOption,
	defaultValue,
	className,
	isLoading = false,
	topSelected,
	noLabel,
	forceEditable,
	label: labelProps,
}: ControlledComponentProps<F, SelectProps>) {
	const formContext = useContext(FormContext);
	const tick = useTicker(isLoading, 5);

	const {
		fieldState,
		field: {value, onChange, name},
	} = controller;

	const errMsg = fieldState.error?.message;
	const label = !noLabel && (labelProps || name).ucwords();

	const isDisabled = forceEditable ? false : formContext?.disabled || disabled;
	const selectedValue = data.find(e => e.value === value);
	const filteredData =
		topSelected && selectedValue?.value
			? [selectedValue, ...data.filter(e => e.value !== selectedValue.value)]
			: data;

	const isLoadingText = !isLoading
		? ''
		: `Harap Tunggu${Array.from({length: tick})
				.map(() => '.')
				.join('')}`;

	const errorMessage = !!errMsg && (
		<Text className="text-red-700 flex items-center">
			<Icon name="faWarning" className="mr-2 text-red-700" />
			{fieldState.error?.message}
		</Text>
	);

	useEffect(() => {
		if (!value && !!defaultValue) setTimeout(() => onChange(defaultValue), 100);
	}, [value, defaultValue]);

	if (isDisabled) {
		return (
			<InputComponent
				disabled
				byPassValue={selectedValue?.label}
				noLabel={noLabel}
				label={label as string}
				controller={controller}
				className={className}
			/>
		);
	}

	return (
		<div
			className={classNames(
				'pt-2',
				{'cursor-not-allowed': isDisabled},
				className,
			)}>
			<Autocomplete
				loading={isLoading}
				loadingText={isLoadingText}
				disableClearable={disableClear}
				options={filteredData}
				disabled={isDisabled}
				defaultValue={selectedValue}
				onChange={(_, option) => onChange(option?.value)}
				getOptionDisabled={({value: OptDisabledValue}) => !OptDisabledValue}
				getOptionLabel={({value: optionValue, label: optionLabel}) =>
					optionLabel || (optionValue as string)
				}
				renderOption={(props, option) => {
					const isSelected = selectedValue?.value === option.value;

					return (
						<Box component="li" {...props} key={option.value} className="m-0">
							<div
								className={classNames(
									'w-full p-4 cursor-pointer',
									'flex items-center justify-between',
									'hover:bg-gray-300 hover:text-white',
									{['bg-green-700 text-white']: isSelected},
								)}>
								{option.label || option.value}
								{isSelected && <Icon name="faCheck" className="text-white" />}
							</div>
						</Box>
					);
				}}
				renderInput={params => (
					<>
						<TextField
							{...params}
							{...defaultTextFieldProps}
							label={label}
							error={!!errMsg}
							placeholder={firstOption}
							sx={{
								'& .MuiInputBase-input.Mui-disabled': {
									WebkitTextFillColor: '#000000',
								},
							}}
						/>
						{errorMessage}
					</>
				)}
			/>
		</div>
	);
}
