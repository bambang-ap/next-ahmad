/* eslint-disable @typescript-eslint/no-unused-vars */
import {FormEventHandler, useRef} from 'react';

import {MutateOptions} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';

import {ModalTypeSelect, TCustomerSPPBOutUpsert} from '@appTypes/app.type';
import {Button, Form, Modal, ModalRef} from '@components';
import {getLayout} from '@hoc';
import {useTableFilterComponent} from '@hooks';
import {SppbOutModalChild} from '@pageComponent/ModalChildSppbOut';
import {SPPBOutGenerateQR} from '@pageComponent/sppbOut_GenerateQR';
import {modalTypeParser, renderItemAsIs, transformIds} from '@utils';
import {trpc} from '@utils/trpc';

SPPBOUT.getLayout = getLayout;

export type FormValue = {
	type: ModalTypeSelect;
	idSppbOuts?: MyObject<boolean>;
} & TCustomerSPPBOutUpsert;

const widthSize = 1250;

export default function SPPBOUT() {
	const {control, reset, watch, clearErrors, handleSubmit} =
		useForm<FormValue>();

	const dataForm = watch();
	const modalRef = useRef<ModalRef>(null);

	const {type: modalType} = dataForm;

	const {isSelect, isAdd, isEdit, isPreview, modalTitle} = modalTypeParser(
		modalType,
		'Surat Jalan Keluar',
	);

	const selectedIds = transformIds(dataForm.idSppbOuts);

	const {component, mutateOpts, refetch} = useTableFilterComponent({
		reset,
		control,
		property: 'idSppbOuts',
		enabledExport: true,
		exportUseQuery: () =>
			trpc.export.sppb.out.useQuery(
				{ids: selectedIds},
				{enabled: selectedIds.length > 0},
			),
		exportRenderItem: renderItemAsIs,
		header: [
			'Nomor Surat',
			'Kendaraan',
			'Customer',
			'Keterangan',
			!isSelect && 'Action',
		],
		genPdfOptions: {
			width: widthSize,
			tagId: 'sppb-out-data-print',
			splitPagePer: 1,
			useQuery: () =>
				trpc.print.sppb.out.useQuery(
					{ids: selectedIds},
					{enabled: selectedIds.length > 0},
				),
			renderItem: pdfData => {
				return <SPPBOutGenerateQR detail={pdfData} width={widthSize} />;
			},
		},
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		useQuery: form => trpc.sppb.out.get.useQuery(form),
		renderItem({Cell, CellSelect, item}) {
			const {id} = item;

			return (
				<>
					<CellSelect fieldName={`idSppbOuts.${id}`} />
					<Cell>{item.invoice_no}</Cell>
					<Cell>{item.OrmKendaraan?.name}</Cell>
					<Cell>{item.OrmCustomer?.name}</Cell>
					<Cell>{item.keterangan}</Cell>

					{!isSelect && (
						<Cell className="flex gap-2">
							{/* <Button icon="faPrint" onClick={() => printData(id)} /> */}
							<Button
								icon="faMagnifyingGlass"
								onClick={() => showModal({...item, type: 'preview'})}
							/>
							<Button
								onClick={() => showModal({...item, type: 'edit'})}
								icon="faEdit"
							/>
							<Button
								onClick={() => showModal({id, type: 'delete'})}
								icon="faTrash"
							/>
						</Cell>
					)}
				</>
			);
		},
	});

	const {mutate: mutateUpsert} = trpc.sppb.out.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.sppb.out.delete.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, ...values}) => {
			const callbackOpt: MutateOptions<any, any, any> = {
				onSuccess() {
					refetch();
					modalRef.current?.hide();
				},
			};

			if (type === 'delete') mutateDelete({id: values.id}, callbackOpt);
			else mutateUpsert(values, callbackOpt);
		})();
	};

	function showModal({type, ...rest}: Partial<FormValue>) {
		reset({...rest, type});
		modalRef.current?.show();
	}

	return (
		<>
			{component}
			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}
					className="flex flex-col gap-2 max-h-[600px] overflow-y-auto">
					<SppbOutModalChild reset={reset} control={control} />

					{(isAdd || isEdit) && <Button type="submit">Submit</Button>}
				</Form>
			</Modal>
		</>
	);
}
