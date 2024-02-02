import {FormEventHandler, useRef} from 'react';

import {MutateOptions} from '@tanstack/react-query';
import {useForm} from 'react-hook-form';

import {ModalTypeSelect, TCustomerSPPBOutUpsert} from '@appTypes/app.type';
import {Button, Form, Modal, ModalRef} from '@components';
import {paperCont} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilterComponent} from '@hooks';
import {SppbOutModalChild} from '@pageComponent/ModalChildSppbOut';
import {SPPBOutGenerateQR} from '@pageComponent/sppbOut_GenerateQR';
import {
	atLeastOneDefined,
	dateUtils,
	modalTypeParser,
	renderIndex,
	renderItemAsIs,
	transformIds,
} from '@utils';
import {bachshrift_normal} from '@utils/js-fonts';
import {trpc} from '@utils/trpc';

SPPBOUT.getLayout = getLayout;

export type FormValue = {
	type: ModalTypeSelect;
	idSppbOuts?: MyObject<boolean>;
} & TCustomerSPPBOutUpsert;

export const widthSize = 1100; // For Portrait
// export const widthSize = 1750; // For Landscape
export const orientation: 'p' | 'l' = 'p';

export default function SPPBOUT() {
	const {control, reset, setValue, watch, clearErrors, handleSubmit} =
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
			'No',
			'Tanggal dibuat',
			'Tanggal Surat',
			'Nomor Surat',
			'Kendaraan',
			'Customer',
			'Keterangan',
			!isSelect && 'Action',
		],
		genPdfOptions: {
			orientation,
			splitPagePer: 1,
			width: widthSize,
			paperSize: paperCont,
			tagId: 'sppb-out-data-print',
			filename: 'surat-jalan-keluar',
			font: bachshrift_normal,
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
		renderItem({Cell, CellSelect, item}, index) {
			const {id, date, createdAt} = item;

			return (
				<>
					<CellSelect fieldName={`idSppbOuts.${id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{dateUtils.full(createdAt)}</Cell>
					<Cell>{dateUtils.date(date)}</Cell>
					<Cell>{renderIndex(item, item.invoice_no!)}</Cell>
					<Cell>{item.dVehicle?.name}</Cell>
					<Cell>{item.dCust?.name}</Cell>
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
		handleSubmit(({type, id, ...formValues}) => {
			const callbackOpt: MutateOptions<any, any, any> = {
				onSuccess() {
					refetch();
					modalRef.current?.hide();
				},
			};

			if (type === 'delete') mutateDelete({id}, callbackOpt);
			else {
				const values = {
					...formValues,
					id,
					po: formValues.po?.map(po => {
						return {
							...po,
							sppb_in: po.sppb_in.map(y => {
								return {
									...y,
									items: entries(y.items).reduce<typeof y.items>(
										(ret, [k, v]) => {
											if (atLeastOneDefined(v)) ret[k] = v;
											return ret;
										},
										{},
									),
								};
							}),
						};
					}),
				};

				mutateUpsert(values, callbackOpt);
			}
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
					<SppbOutModalChild
						setValue={setValue}
						reset={reset}
						control={control}
					/>

					{(isAdd || isEdit) && <Button type="submit">Submit</Button>}
				</Form>
			</Modal>
		</>
	);
}
