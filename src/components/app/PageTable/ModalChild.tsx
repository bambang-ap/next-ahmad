import {Control, useWatch} from 'react-hook-form';

import {Button, Text} from '@components';
import {allowedPages} from '@constants';

import {RenderField} from './RenderField';

export function ModalChild({control, path}: {control: Control; path: string}) {
	const {modalField} = allowedPages[path as keyof typeof allowedPages] ?? {};

	const modalType = useWatch({control, name: 'type'});

	if (modalType === 'delete') {
		return (
			<div>
				<Text>Hapus ?</Text>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<>
			{(modalType === 'add' || modalType === 'edit') &&
				modalField?.[modalType]?.map(item => (
					<RenderField key={item.col} control={control} item={item} />
				))}

			<Button type="submit">Submit</Button>
		</>
	);
}
