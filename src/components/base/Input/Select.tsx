import {useState} from 'react';

import {FieldValues} from 'react-hook-form';

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

	return (
		<div className="h-10">
			<div className="flex">
				<input
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
			<div
				className={`fixed ${!visible && 'h-0'} overflow-hidden bg-white z-10`}>
				{data.mmap((item, index) => {
					return (
						<div onClick={() => onSelect?.(item, index)}>
							{renderItem(item, index)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export const Select = withReactFormController(SelectComponent);
