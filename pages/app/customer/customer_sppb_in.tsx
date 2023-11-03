import {FormEventHandler, useRef} from 'react';

import {useForm} from 'react-hook-form';

import {
	ModalTypePreview,
	ModalTypeSelect,
	TUpsertSppbIn,
} from '@appTypes/app.type';
import {
	Button,
	CellSelect,
	Form,
	Modal,
	ModalRef,
	TableFilterV3,
	TableFilterV3Ref,
	VRenderItem,
} from '@components';
import {getLayout} from '@hoc';
import {useLoader, useNewExportData} from '@hooks';
import {SppbInModalChild} from '@pageComponent/ModalChild_customer_sppb_in';
import {SppbInRows} from '@trpc/routers/sppb/in';
import {dateUtils, modalTypeParser, transformIds} from '@utils';
import {trpc} from '@utils/trpc';

export type FormType = {
	type: ModalTypeSelect;
	id_customer?: string;
	idSppbIns?: MyObject<boolean>;
} & TUpsertSppbIn &
	Partial<Pick<SppbInRows, 'OrmPOItemSppbIns' | 'OrmCustomerPO'>>;

SPPBIN.getLayout = getLayout;

export default function SPPBIN() {
	const modalRef = useRef<ModalRef>(null);
	const tableRef = useRef<TableFilterV3Ref>(null);
	const {mutateOpts, ...loader} = useLoader();

	const {control, handleSubmit, watch, reset, clearErrors} = useForm<FormType>({
		defaultValues: {type: 'add'},
	});

	const {mutate: mutateUpsert} = trpc.sppb.in.upsert.useMutation(mutateOpts);
	const {mutate: mutateDelete} = trpc.sppb.in.delete.useMutation(mutateOpts);

	const dataForm = watch();
	const {type: modalType} = dataForm;

	const {isPreview, modalTitle, isSelect} = modalTypeParser(
		modalType,
		'SPPB In',
	);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, po_item = [], ...rest}) => {
			if (type === 'delete') return mutateDelete({id: rest.id}, {onSuccess});

			mutateUpsert({...rest, po_item: po_item.filter(Boolean)}, {onSuccess});
		})();

		function onSuccess() {
			modalRef.current?.hide();
			tableRef.current?.refetch?.();
		}
	};

	function showModal(
		type: ModalTypePreview,
		initValue?: Partial<TUpsertSppbIn>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	const selectedIds = transformIds(dataForm.idSppbIns);
	const {exportResult} = useNewExportData(
		() => {
			return trpc.export.sppb.in.useQuery(
				{ids: selectedIds!},
				{
					enabled: selectedIds.length! > 0,
				},
			);
		},
		exportedData => exportedData,
	);

	return (
		<>
			{loader.component}
			<TableFilterV3
				ref={tableRef}
				control={control}
				reset={reset}
				property="idSppbIns"
				enabledExport
				useQuery={form => trpc.sppb.in.getPage.useQuery(form)}
				exportResult={exportResult}
				keyExtractor={item => item?.id}
				topComponent={<Button onClick={() => showModal('add', {})}>Add</Button>}
				header={[
					'No',
					'Tanggal Surat Jalan',
					'Nomor PO',
					'Customer',
					'Nomor Surat Jalan',
					!isSelect && 'Action',
				]}
				renderItem={({Cell, item}: VRenderItem<SppbInRows>, index: number) => {
					const {id} = item;
					return (
						<>
							{isSelect && (
								<CellSelect
									noLabel
									control={control}
									fieldName={`idSppbIns.${item.id}`}
								/>
							)}
							<Cell>{index + 1}</Cell>
							<Cell>{dateUtils.date(item.tgl)}</Cell>
							<Cell>{item.OrmCustomerPO?.nomor_po}</Cell>
							<Cell>{item.OrmCustomerPO?.OrmCustomer.name}</Cell>
							<Cell>{item.nomor_surat}</Cell>
							{!isSelect && (
								<Cell className="flex gap-2">
									<Button onClick={() => showModal('preview', item)}>
										Preview
									</Button>
									<Button onClick={() => showModal('edit', item)}>Edit</Button>
									<Button onClick={() => showModal('delete', {id})}>
										Delete
									</Button>
								</Cell>
							)}
						</>
					);
				}}
			/>

			<Modal size="xl" title={modalTitle} ref={modalRef}>
				<Form
					context={{disabled: isPreview, hideButton: isPreview}}
					onSubmit={submit}>
					<SppbInModalChild reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}
