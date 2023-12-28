import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {
	ModalTypePreview,
	ModalTypeSelect,
	TKanban,
	TKanbanUpsert,
} from '@appTypes/app.zod';
import {Button, Form, Modal, ModalRef} from '@components';
import {cuttingLineClassName, isProd, nonRequiredRefetch} from '@constants';
import {PATHS} from '@enum';
import {getLayout} from '@hoc';
import {useRouter, useTableFilterComponent} from '@hooks';
import {RenderKanbanCardV2} from '@pageComponent/KanbanCardV2';
import {NewKanbanModalChild} from '@pageComponent/kanban_ModalChild/index-new';
import {
	classNames,
	dateUtils,
	getIds,
	modalTypeParser,
	renderIndex,
	renderItemAsIs,
} from '@utils';
import {trpc} from '@utils/trpc';

Kanban.getLayout = getLayout;

export type KanbanFormType = TKanbanUpsert & {
	type: ModalTypeSelect;
	idKanbans?: MyObject<boolean>;
	id_customer: string;
	temp_id_item: string;
	callbacks?: Array<() => void>;
};

export default function Kanban() {
	const modalRef = useRef<ModalRef>(null);

	const {push} = useRouter();
	const {control, watch, reset, clearErrors, handleSubmit} =
		useForm<KanbanFormType>();

	const dataForm = watch();

	const {type: modalType} = dataForm;
	const {isPreview, isSelect, modalTitle} = modalTypeParser(
		modalType,
		'Kanban',
	);

	const {property, selectedIds} = getIds(dataForm, 'idKanbans');

	const {mutateOpts, component, refetch} = useTableFilterComponent({
		control,
		reset,
		property,
		header: [
			'No',
			!isProd && 'ID Kanban',
			'Tanggal',
			'Nomor PO',
			'Nomor Kanban',
			'Nomor Surat',
			'Customer',
			'Mesin',
			'Keterangan',
			'Di cetak',
			!isSelect && 'Action',
		],
		topComponent: (
			<>
				<Button onClick={() => showModal('add', {})}>Add</Button>
				<Button onClick={navigateReject}>Reject List</Button>
			</>
		),
		enabledExport: true,
		exportRenderItem: renderItemAsIs,
		afterPrint: updatePrint,
		exportUseQuery: () =>
			trpc.export.kanban.useQuery(
				{idKanbans: selectedIds},
				{enabled: selectedIds.length > 0},
			),
		genPdfOptions: {
			width: 1850,
			splitPagePer: 4,
			orientation: 'l',
			tagId: 'kanban-data-print',
			useQuery: () =>
				trpc.print.kanban.useQuery(
					{id: selectedIds},
					{enabled: selectedIds.length > 0},
				),
			renderItem: data => {
				return (
					<div
						key={data.id}
						className={classNames('w-1/2 p-6', cuttingLineClassName)}>
						<RenderKanbanCardV2 {...data} />
					</div>
				);
			},
		},
		useQuery: form => trpc.kanban.getPage.useQuery(form),
		renderItem: ({Cell, CellSelect, item}, index) => {
			return (
				<>
					<CellSelect fieldName={`idKanbans.${item.id}`} />
					<Cell>{index + 1}</Cell>
					{!isProd && <Cell>{item.id}</Cell>}
					<Cell>{dateUtils.date(item.createdAt)}</Cell>
					<Cell>{item.OrmCustomerPO.nomor_po}</Cell>
					<Cell>{renderIndex(item, item.nomor_kanban!)}</Cell>
					<Cell>{item?.OrmCustomerSPPBIn?.nomor_surat}</Cell>
					<Cell>{item.OrmCustomerPO?.OrmCustomer?.name}</Cell>
					<Cell>
						<RenderNameMesin list_mesin={item.list_mesin} />
					</Cell>
					<Cell>{item.keterangan}</Cell>
					<Cell className="flex justify-center">{item.printed}</Cell>
					{!isSelect && (
						<Cell className="flex gap-x-2">
							{/* <Button icon="faPrint" onClick={() => printData(item.id)} /> */}
							<Button
								icon="faMagnifyingGlass"
								onClick={() => showModal('preview', item)}
							/>
							<Button onClick={() => showModal('edit', item)} icon="faEdit" />
							<Button
								onClick={() => showModal('delete', {id: item.id})}
								icon="faTrash"
							/>
						</Cell>
					)}
				</>
			);
		},
	});

	const {mutate: mutateUpsert} = trpc.kanban.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.kanban.delete.useMutation(mutateOpts);
	const {mutateAsync: mutatePrint} =
		trpc.kanban.printed.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async ({type, callbacks, list_mesin = {}, ...rest}) => {
			if (callbacks) callbacks.forEach(callback => callback());

			switch (type) {
				case 'add':
				case 'edit':
					return mutateUpsert({...rest, list_mesin}, {onSuccess});
				case 'delete':
					return mutateDelete({id: rest.id}, {onSuccess});
				default:
					return null;
			}
		})();

		function onSuccess() {
			modalRef.current?.hide();
			refetch();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<Omit<KanbanFormType, 'type'>>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	function updatePrint(): void {
		mutatePrint(selectedIds);
	}

	function navigateReject() {
		push(PATHS.app_kanban_reject);
	}

	return (
		<>
			{component}
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form
					onSubmit={submit}
					context={{disabled: isPreview, hideButton: isPreview}}>
					<NewKanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}

function RenderNameMesin({list_mesin}: Pick<TKanban, 'list_mesin'>) {
	const {data} = trpc.kanban.nameMesin.useQuery(
		{list_mesin},
		nonRequiredRefetch,
	);

	return <>{data?.map(e => e.dataKMesin.name).join(' | ')}</>;
}
