import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';
// import * as XLSX from 'xlsx';

import {ModalTypePreview} from '@appTypes/app.type';
import {Button, Form, Modal, ModalRef} from '@components';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import PoModalChild, {FormType} from '@pageComponent/ModalChild_po';
import {dateUtils, getIds, modalTypeParser} from '@utils';
import {exportPoMapper} from '@utils/data-mapper';
import {trpc} from '@utils/trpc';

POCustomer.getLayout = getLayout;

export default function POCustomer() {
	const modalRef = useRef<ModalRef>(null);

	const {control, reset, watch, clearErrors, handleSubmit} =
		useForm<FormType>();
	const dataForm = watch();

	const {type: modalType} = dataForm;
	const {property, selectedIds} = getIds(dataForm, 'idPo');
	const {modalTitle, isDelete, isPreview} = modalTypeParser(
		modalType,
		'Customer PO',
	);

	const {headers, renderItem} = exportPoMapper();

	const {component, mutateOpts, refetch} = useTableFilterComponentV2({
		reset,
		control,
		property,
		header: [
			'No',
			'Nomor PO',
			'Customer',
			'Tanggal',
			'Due Date',
			'Status',
			'Score',
			'Action',
		],
		topComponent: <Button onClick={() => showModal('add', {})}>Add</Button>,
		exportOptions: {
			headers,
			renderItem,
			useQuery: () =>
				trpc.export.po.useQuery(
					{ids: selectedIds},
					{enabled: selectedIds.length > 0},
				),
		},
		useQuery: form => trpc.customer_po.getV2.useQuery(form),
		renderItem({item, Cell, CellSelect}, index) {
			const {
				id,
				tgl_po,
				status,
				due_date,
				nomor_po,
				OrmCustomer: customer,
				poScore,
			} = item;

			return (
				<>
					<CellSelect fieldName={`idPo.${id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{nomor_po}</Cell>
					<Cell>{customer?.name}</Cell>
					<Cell>{dateUtils.date(tgl_po)}</Cell>
					<Cell>{dateUtils.date(due_date)}</Cell>
					<Cell>{status}</Cell>
					<Cell>{poScore}</Cell>
					<Cell className="flex gap-x-2">
						<Button onClick={() => showModal('preview', item)}>Preview</Button>
						<Button onClick={() => showModal('edit', item)}>Edit</Button>
						<Button onClick={() => showModal('delete', {id})}>Delete</Button>
					</Cell>
				</>
			);
		},
	});

	const insertPO = trpc.customer_po.add.useMutation(mutateOpts);
	const updatePO = trpc.customer_po.update.useMutation(mutateOpts);
	const deletePO = trpc.customer_po.delete.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, id, OrmCustomerPOItems: po_item = [], ...rest}) => {
			const onSuccess = () => {
				modalRef.current?.hide();
				refetch();
			};

			switch (type) {
				case 'add':
					return insertPO.mutate({...rest, po_item}, {onSuccess});
				case 'edit':
					return updatePO.mutate({id, po_item, ...rest}, {onSuccess});
				case 'delete':
					return deletePO.mutate({id}, {onSuccess});
				default:
					return null;
			}
		})();
	};

	function showModal(type: ModalTypePreview, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}
	// NOTE: contoh export dg type number

	// async function jj(file?: File) {
	// 	// const [filename = 'data', sheetName = 'Sheet 1'] = [];

	// 	// const wb = XLSX.utils.book_new();
	// 	// const ws = XLSX.utils.aoa_to_sheet([
	// 	// 	['a', 'b', 'c'],
	// 	// 	[1, 2, 3],
	// 	// ]);

	// 	// XLSX.utils.book_append_sheet(wb, ws, sheetName);
	// 	// XLSX.writeFile(wb, `${filename}.xlsx`);

	// 	/* Create worksheet from simple data */
	// 	const ws = XLSX.utils.aoa_to_sheet([
	// 		['General', 54337],
	// 		['Currency', 3.5],
	// 		['Thousands', 7262],
	// 		['Percent', 0.0219],
	// 	]);

	// 	/* assign number formats */
	// 	ws['B2'].z = '"$"#,##0.00_);\\("$"#,##0.00\\)';
	// 	ws['B3'].z = '#,##0';
	// 	ws['B4'].z = '0.00%';

	// 	const wb = XLSX.utils.book_new();

	// 	XLSX.utils.book_append_sheet(wb, ws, 'Formats');

	// 	XLSX.writeFile(wb, 'SheetJSSimpleNF.xlsx');
	// }

	return (
		<>
			{/* <Button onClick={jj}>KKK</Button> */}
			{/* <input
				type="file"
				accept=".xls,.xlsx"
				onChange={e => {
					const selectedFile = e.target.files?.[0];
					if (!selectedFile) return;
					jj(selectedFile);
				}}
			/> */}
			<Modal
				ref={modalRef}
				title={modalTitle}
				size={isDelete ? undefined : 'xl'}>
				<Form
					onSubmit={submit}
					context={{hideButton: isPreview, disabled: isPreview}}>
					<PoModalChild reset={reset} control={control} />
				</Form>
			</Modal>
			<div className="overflow-x-auto w-full">{component}</div>
		</>
	);
}
