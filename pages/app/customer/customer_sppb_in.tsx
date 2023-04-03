import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {ModalTypePreview, TUpsertSppbIn} from '@appTypes/app.type';
import {Button, Modal, ModalRef, TableFilter} from '@components';
import {defaultErrorMutation} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilter} from '@hooks';
import {SppbInModalChild} from '@pageComponent/ModalChild_customer_sppb_in';
import {dateUtils} from '@utils';
import {trpc} from '@utils/trpc';

export type FormType = {type: ModalTypePreview} & TUpsertSppbIn;

SPPBIN.getLayout = getLayout;

export default function SPPBIN() {
	const modalRef = useRef<ModalRef>(null);
	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		defaultValues: {type: 'add'},
	});

	const {formValue, hookForm} = useTableFilter();

	const {data, refetch} = trpc.sppb.getPage.useQuery({
		type: 'sppb_in',
		...formValue,
	});
	const {mutate: mutateUpsert} =
		trpc.sppb.upsert.useMutation(defaultErrorMutation);
	const {mutate: mutateDelete} =
		trpc.sppb.delete.useMutation(defaultErrorMutation);

	const modalType = watch('type');
	const modalTitle =
		modalType === 'add'
			? `add SPPB In`
			: modalType === 'edit'
			? `edit SPPB In`
			: modalType === 'preview'
			? `preview SPPB In`
			: `delete SPPB In`;

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, po_item, ...rest}) => {
			if (type === 'delete') return mutateDelete({id: rest.id}, {onSuccess});

			mutateUpsert({...rest, po_item: po_item.filter(Boolean)}, {onSuccess});
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<TUpsertSppbIn>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<TableFilter
				form={hookForm}
				data={data?.rows}
				pageCount={data?.totalPage}
				topComponent={<Button onClick={() => showModal('add', {})}>Add</Button>}
				header={[
					'Tanggal Surat Jalan',
					'Nomor PO',
					'Nomor Surat Jalan',
					'Nomor Lot',
					'Action',
				]}
				renderItem={({Cell, item}) => {
					const {id} = item;
					return (
						<>
							<Cell>{dateUtils.date(item.tgl)}</Cell>
							<Cell>{item.detailPo?.nomor_po}</Cell>
							<Cell>{item.nomor_surat}</Cell>
							<Cell>{item.lot_no}</Cell>
							<Cell className="flex gap-2">
								<Button onClick={() => showModal('preview', item)}>
									Preview
								</Button>
								<Button onClick={() => showModal('edit', item)}>Edit</Button>
								<Button onClick={() => showModal('delete', {id})}>
									Delete
								</Button>
							</Cell>
						</>
					);
				}}
			/>

			<Modal size="6xl" title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<SppbInModalChild control={control} />
				</form>
			</Modal>
		</>
	);
}
