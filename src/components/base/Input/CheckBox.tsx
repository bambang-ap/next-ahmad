import {PropsWithChildren} from 'react';

import {Icon, Text} from '@components';
import {classNames} from '@utils';

type Props = PropsWithChildren<{
	hidden?: boolean;
	className?: string;
	onCheck?: (value: boolean) => void;
	value?: boolean | '@';
	label?: string | false;
	disabled?: boolean;
}>;

export function CheckBox({
	hidden,
	className,
	onCheck,
	value,
	disabled,
	label,
	children: errorMessage,
}: Props) {
	return (
		<div
			onClick={disabled ? noop : () => onCheck?.(!value)}
			className={classNames(
				'flex items-center !px-0 !py-0',
				{hidden, 'cursor-pointer': !disabled, 'cursor-not-allowed': disabled},
				className,
			)}>
			<div className="flex justify-center items-center mr-2 border rounded h-6 w-6">
				{value && <Icon name={value === '@' ? 'faMinus' : 'faCheck'} />}
			</div>
			<Text>{label}</Text>
			{errorMessage}
		</div>
	);
}
