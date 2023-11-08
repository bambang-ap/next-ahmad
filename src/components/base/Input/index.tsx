import {ChangeEventHandler, useContext, useEffect, useRef} from 'react';

import {TextField, useTheme} from '@mui/material';
import {CalendarPicker} from '@mui/x-date-pickers';
import {AdapterMoment} from '@mui/x-date-pickers/AdapterMoment';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {FieldValues, useForm} from 'react-hook-form';

import {FormContext, Icon, Modal, ModalRef, Spinner, Text} from '@components';
import {
	decimalRegex,
	decimalSchema,
	decimalValue as decimalValuee,
	defaultTextFieldProps,
	formatDate,
	formatDateView,
} from '@constants';
import {
	ControlledComponentProps,
	withReactFormController,
} from '@formController';
import {classNames, moment} from '@utils';

import {CheckBox} from './CheckBox';

export type InputProps = {
	byPassValue?: string | number | boolean;
	hidden?: boolean;
	placeholder?: string;
	label?: string;
	noLabel?: boolean;
	disabled?: boolean;
	multiline?: boolean;
	forceEditable?: boolean;
	decimalValue?: number;
	isLoading?: boolean;
	isError?: boolean;
	errorMessage?: string;
	minDate?: moment.Moment;
	maxDate?: moment.Moment;
	type?:
		| 'number'
		| 'decimal'
		| 'text'
		| 'search'
		| 'checkbox'
		| 'password'
		| 'date';
};

export const Input = withReactFormController(InputComponent);

export function InputComponent<F extends FieldValues>(
	props: ControlledComponentProps<F, InputProps>,
) {
	let restProps: MyObject<any> = {};
	const theme = useTheme();
	const {
		byPassValue,
		hidden,
		type = 'text',
		label: labelProps,
		disabled,
		className,
		controller,
		placeholder,
		noLabel,
		defaultValue,
		rightAcc: endAdornment,
		leftAcc: startAdornment,
		appliedRules,
		multiline,
		forceEditable,
		isLoading = false,
		isError = false,
		errorMessage: message,
		decimalValue = decimalValuee,
		maxDate,
		minDate,
	} = props;

	const formContext = useContext(FormContext);
	const modalRef = useRef<ModalRef>(null);

	const {
		fieldState,
		field: {value, onChange, ...field},
	} = controller;

	const isDisabled = formContext?.disabled || disabled;
	const label = !noLabel && (labelProps || field.name).toString().ucwords();

	const errorMessage = fieldState.error?.message && (
		<Text className="text-red-700 flex items-center">
			<Icon name="faWarning" className="mr-2 text-red-700" />
			{fieldState.error?.message}
		</Text>
	);

	const bottomInfo = isLoading ? (
		<Spinner />
	) : isError ? (
		<div className="whitespace-nowrap text-md text-red-500">{message}</div>
	) : null;

	useEffect(() => {
		if (!value && !!defaultValue) setTimeout(() => onChange(defaultValue), 100);
	}, [value, defaultValue]);

	switch (type) {
		case 'date': {
			return (
				<div
					className={classNames(
						'relative pt-2',
						{'cursor-pointer': !isDisabled},
						className,
					)}>
					<div
						className="absolute z-10 w-full h-full"
						onClick={isDisabled ? undefined : () => modalRef.current?.show()}
					/>
					<TextField
						{...defaultTextFieldProps}
						InputLabelProps={defaultTextFieldProps.InputLabelProps}
						className="cursor-pointer w-full"
						error={!!errorMessage}
						fullWidth
						label={label}
						disabled
						sx={{
							'& .MuiInputBase-input.Mui-disabled': {
								WebkitTextFillColor: '#000000',
							},
							'& .MuiFormLabel-root.Mui-disabled': {
								WebkitTextFillColor: theme.colors.alpha.black[50],
							},
							'& .MuiInputBase-root.Mui-disabled': {
								backgroundColor: isDisabled
									? theme.colors.alpha.black[10]
									: theme.colors.alpha.white,
							},
						}}
						placeholder={formatDateView}
						value={value ? moment(value).format(formatDateView) : undefined}
						InputProps={{
							startAdornment,
							endAdornment: <Icon name="faCalendar" />,
							classes: {input: 'focus:bg-yellow'},
						}}
						{...restProps}
						{...field}
					/>
					{errorMessage}
					<Modal ref={modalRef}>
						<LocalizationProvider dateAdapter={AdapterMoment}>
							<CalendarPicker
								minDate={minDate}
								maxDate={maxDate}
								date={moment(value)}
								allowSameDateSelection
								onChange={(date, state) => {
									if (state !== 'finish') return;

									modalRef.current?.hide();
									onChange(date?.format(formatDate));
								}}
							/>
						</LocalizationProvider>
					</Modal>
				</div>
			);
		}
		case 'checkbox': {
			const byPassed = typeof byPassValue !== 'undefined';

			function onCheck() {
				onChange(!value);
			}

			return (
				<CheckBox
					label={label}
					hidden={hidden}
					onCheck={onCheck}
					disabled={isDisabled}
					className={className}
					value={byPassed ? (byPassValue as boolean) : value}>
					{errorMessage}
				</CheckBox>
			);
		}

		default: {
			const onChangeEvent: ChangeEventHandler<HTMLInputElement> = function (
				event,
			) {
				switch (type) {
					case 'number':
						return onChange(parseInt(event.target.value));
					case 'decimal':
						const strValue = event.target.value
							.toString()
							.replace(/[^0-9.]/g, '')
							.replace(/(?<=\..*)\./g, '');

						const parsed = decimalSchema.safeParse(strValue);

						if (parsed.success) return onChange(parsed.data);

						appliedRules?.({
							pattern: {
								message: `"${strValue}" is not a number format or max number after "." is ${decimalValue}`,
								value: decimalRegex,
							},
						});
						return onChange(strValue);
					default:
						return onChange(event);
				}
			};

			return (
				<div className={classNames({hidden}, 'pt-2', className)}>
					<TextField
						{...defaultTextFieldProps}
						multiline={multiline}
						InputLabelProps={{
							...defaultTextFieldProps.InputLabelProps,
							// shrink: type === 'date' ? true : undefined,
						}}
						error={!!errorMessage}
						fullWidth
						label={label}
						type={type}
						disabled={forceEditable ? false : isDisabled}
						sx={{
							'& .MuiInputBase-input.Mui-disabled': {
								WebkitTextFillColor: '#000000',
							},
						}}
						placeholder={placeholder}
						value={byPassValue ?? value ?? ''}
						onChange={onChangeEvent}
						InputProps={{
							endAdornment: (
								<>
									{bottomInfo}
									{endAdornment}
								</>
							),
							startAdornment,
							classes: {input: 'focus:bg-yellow'},
						}}
						{...restProps}
						{...field}
					/>
					{errorMessage}
				</div>
			);
		}
	}
}

export function InputDummy(
	props: Omit<GetProps<typeof Input>, 'control' | 'fieldName'>,
) {
	const {control} = useForm({defaultValues: {dummyInput: ''}});

	return <Input control={control} fieldName="dummyInput" {...props} />;
}
