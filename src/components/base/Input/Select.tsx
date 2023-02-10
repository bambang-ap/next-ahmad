import {useState} from 'react';

import {FieldValues} from 'react-hook-form';

import {focusInputClassName, inputClassName} from '@constants';
import {ControlledComponentProps, withReactFormController} from '@hoc';

import {Icon} from '../Icon';
import {TableProps} from '../Table';

export type SelectProps<T> = Pick<TableProps<T>, 'data' | 'renderItem'> & {
	onSelect?: MMapCallback<T, void>;
	editable?: boolean;
};

function SelectComponent<T, F extends FieldValues>({
	data,
	onSelect,
	renderItem,
	controller,
	editable = true,
}: ControlledComponentProps<F, SelectProps<T>>) {
	const [visible, setVisible] = useState(false);
	const {
		field: {value, name, onChange},
	} = controller;

	const visibleClassName =
		visible && 'rounded-tr-none rounded-tl-none border-t-0';
	const visibleClassNameParent = visible && 'rounded-br-none rounded-bl-none';

	return (
		<div className="pb-2 relative">
			<div
				className={`flex items-center ${inputClassName} ${visibleClassNameParent} ${focusInputClassName}`}>
				<input
					className="outline-none flex flex-1 mr-2"
					type="text"
					value={value}
					placeholder={name}
					onChange={editable ? e => onChange(e.target.value) : noopVoid}
				/>
				<Icon
					name={visible ? 'faChevronUp' : 'faChevronDown'}
					onClick={() => setVisible(e => !e)}
				/>
			</div>
			{visible && (
				<div
					className={`${inputClassName} ${visibleClassName} max-h-28 overflow-y-auto border overflow-hidden bg-white z-50`}>
					{data.mmap((item, index) => {
						return (
							<div
								onClick={() => {
									onSelect?.(item, index);
									setVisible(false);
								}}>
								{renderItem(item, index)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export const Select = SelectComponent;
