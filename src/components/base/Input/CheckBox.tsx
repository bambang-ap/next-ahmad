import {PropsWithChildren} from 'react';

import {Icon, Text} from '@components';
import {classNames} from '@utils';

export type CheckboxProps = PropsWithChildren<{
	hidden?: boolean;
	className?: string;
	onCheck?: (value: boolean) => void;
	value?: boolean | '@';
	label?: string | false;
	disabled?: boolean;
	renderChildren?: (value: boolean) => JSX.Element;
}>;

export function CheckBox({
	hidden,
	className,
	onCheck,
	value,
	disabled,
	label,
	renderChildren,
	children: errorMessage,
}: CheckboxProps) {
	const checkBox = (
		<>
			<div className="flex justify-center items-center mr-2 border rounded p-1">
				<Icon
					className={classNames({'text-transparent': !value})}
					name={value === '@' ? 'faMinus' : 'faCheck'}
				/>
			</div>
			<Text className="select-none">{label}</Text>
		</>
	);

	return (
		<div
			onClick={disabled ? noop : () => onCheck?.(!value)}
			className={classNames(
				'flex items-center !px-0 !py-0',
				{hidden, 'cursor-pointer': !disabled, 'cursor-not-allowed': disabled},
				className,
			)}>
			{!!renderChildren ? renderChildren(value as boolean) : checkBox}
			{errorMessage}
		</div>
	);
}
