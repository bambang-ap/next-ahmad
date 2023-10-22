import {useRef} from 'react';

import {useForm} from 'react-hook-form';

import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SItem} from '@appTypes/app.zod';
import {
	Button,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
} from '@components';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

type FormType = SItem & {type: ModalTypeSelect};

InternalItem.getLayout = getLayout;

export default function InternalItem() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch} = useForm<FormType>();
	// const dataForm = watch;
	// const {property, selectedIds} = getIds(dataForm, 'selectedIds');
	// const {component} = useTableFilterComponentV2({
	// 	reset,
	// 	control,
	// 	property,
	// 	useQuery: form => trpc.internal.item.get.useQuery(form),
	// });

	// return <>{component}</>;

	function showModal({type, ...initValue}: Partial<FormType>) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Button onClick={() => showModal({type: 'add'})}>Add</Button>
			<Modal ref={modalRef}>
				<RenderModal control={control} />
			</Modal>
		</>
	);
}

function RenderModal({control}: FormProps<FormType>) {
	const {data} = trpc.internal.supplier.get.useQuery({limit: 99999});

	return (
		<>
			<Input control={control} fieldName="nama" />
			<Input type="checkbox" control={control} fieldName="ppn" />
			<Select
				data={selectMapper(data?.rows ?? [], 'id', 'nama')}
				control={control}
				fieldName="sup_id"
			/>
		</>
	);
}
