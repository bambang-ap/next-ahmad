import {FieldValues} from 'react-hook-form';

import {ControlledComponentProps, withReactFormController} from '@hoc';

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
	const {
		field: {value, onChange},
	} = controller;

	return (
		<div>
			<input
				type="text"
				value={value}
				onChange={editable ? e => onChange(e.target.value) : noopVoid}
			/>
			{data.mmap((item, index) => {
				return (
					<div onClick={() => onSelect?.(item, index)}>
						{renderItem(item, index)}
					</div>
				);
			})}
		</div>
	);
}

export const Select = withReactFormController(SelectComponent);
