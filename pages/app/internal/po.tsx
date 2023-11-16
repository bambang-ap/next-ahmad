import {FormEventHandler, Fragment, useRef} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {Wrapper} from '@appComponent/Wrapper';
import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SPoUpsert} from '@appTypes/app.zod';
import {
	BorderTd,
	Button,
	Form,
	Input,
	InputDummy,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
} from '@components';
import {
	IMIConst,
	ppnMultiply,
	ppnPercentage,
	selectUnitDataInternal,
} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilterComponentV2} from '@hooks';
import type {RetPoInternal} from '@trpc/routers/internal/poRouters';
import {
	dateUtils,
	formParser,
	modalTypeParser,
	moment,
	numberFormat,
} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SPoUpsert;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalPo.getLayout = getLayout;

export default function InternalPo() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete, selectedIds, property} = formParser(
		dataForm,
		{
			pageName: 'PO',
			property: 'selectedIds',
		},
	);

	const {component, refetch, mutateOpts} = useTableFilterComponentV2({
		reset,
		control,
		property,
		genPdfOptions: {
			tagId: 'internal-po',
			splitPagePer: 1,
			width: 750,
			renderItem: item => <RenderPdf {...item} />,
			useQuery: () => trpc.internal.po.export.useQuery({ids: selectedIds}),
		},
		useQuery: form => trpc.internal.po.get.useQuery(form),
		header: [
			'No',
			'Nama Supplier',
			'Nomor PO',
			'Date',
			'Due Date',
			'Status',
			'Action',
		],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {oSup: dSSUp, date, due_date, status, nomor_po} = item;

			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp?.nama}</Cell>
					<Cell>{nomor_po}</Cell>
					<Cell>{date}</Cell>
					<Cell>{due_date}</Cell>
					<Cell>{status}</Cell>
					<Cell className="gap-2">
						<Button
							icon="faMagnifyingGlass"
							onClick={() => showModal({type: 'preview', form: item})}
						/>
						<Button
							icon="faEdit"
							onClick={() => showModal({type: 'edit', form: item})}
						/>
						<Button
							icon="faTrash"
							onClick={() => showModal({type: 'delete', form: item})}
						/>
					</Cell>
				</>
			);
		},
	});

	const {mutateAsync: mutateUpsert} =
		trpc.internal.po.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.po.delete.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async value => {
			if (isDelete) mutateDelete({id: value.form.id!}, {onSuccess});
			else mutateUpsert(value.form, {onSuccess});

			function onSuccess() {
				refetch();
				modalRef.current?.hide();
			}
		})();
	};

	function showModal({type, ...initValue}: Partial<FormType>) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			{component}
			<Modal size="lg" title={modalTitle} ref={modalRef}>
				<Form
					context={{hideButton: isPreview, disabled: isPreview}}
					onSubmit={submit}>
					<RenderModal control={control} reset={reset} />
				</Form>
			</Modal>
		</>
	);
}

function RenderModal({
	control,
	reset,
}: FormProps<FormType, 'control' | 'reset'>) {
	const {type, form} = useWatch({control});

	const {isDelete, isEdit} = modalTypeParser(type);
	const {data: dataSup} = trpc.internal.supplier.get.useQuery({
		limit: 9999,
	});
	const {data: invoice} = trpc.internal.po.getInvoice.useQuery();
	const {data: dataItem} = trpc.internal.item.get.useQuery(
		{limit: 9999, id: form?.sup_id},
		{enabled: !!form?.sup_id},
	);

	if (isDelete) return <Button type="submit">Hapus</Button>;

	const keySup = `${!!dataSup}${form?.sup_id}`;
	const selectedItems =
		form?.oPoItems?.map(e => e.id_item).filter(Boolean) ?? [];

	function addItem() {
		reset(prev => {
			const oItems = prev.form.oPoItems?.slice?.() ?? [];
			oItems.push({temp_id: uuid()} as typeof oItems[number]);
			return {...prev, form: {...prev.form, oPoItems: oItems}};
		});
	}

	function removeItem(id: string) {
		reset(prev => {
			const oItems = prev.form.oPoItems?.slice?.() ?? [];
			const index = oItems.findIndex(e => e.id === id || e.temp_id === id);

			return {
				...prev,
				form: {...prev.form, oPoItems: oItems.remove(index)},
			};
		});
	}

	return (
		<div className="flex flex-col gap-2">
			<Select
				key={keySup}
				label="Supplier"
				disabled={isEdit}
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(dataSup?.rows ?? [], 'id', 'nama')}
			/>
			<Input
				disabled
				control={control}
				defaultValue={invoice}
				fieldName="form.nomor_po"
				label="Nomor PO"
			/>

			<div className="flex gap-2">
				<Input
					type="date"
					control={control}
					className="flex-1"
					fieldName="form.date"
					label="Date"
				/>

				{!!form?.date && (
					<Input
						type="date"
						label="Due Date"
						className="flex-1"
						control={control}
						fieldName="form.due_date"
						minDate={moment(form.date).add(1, 'day')}
					/>
				)}
			</div>

			<Input
				control={control}
				defaultValue={invoice}
				fieldName="form.keterangan"
				label="Keterangan"
			/>

			<Table
				topComponent={
					<Button className="w-full" onClick={addItem}>
						Tambah Item
					</Button>
				}
				data={form?.oPoItems}
				renderItem={({Cell, item}, i) => {
					const idItem = item.id ?? item.temp_id!;
					const oItem =
						item.oItem ?? dataItem?.rows.find(e => e.id === item.id_item);
					const keyItem = `${keySup}${!!dataItem}${!!oItem}${idItem}`;

					const itemSelections = selectMapper(
						dataItem?.rows ?? [],
						'id',
						'nama',
					).filter(
						e => e.value === item.id_item || !selectedItems.includes(e.value),
					);

					return (
						<Fragment key={idItem}>
							<Input
								hidden
								control={control}
								fieldName={`form.oPoItems.${i}.qty`}
							/>
							<Cell width="30%">
								<Select
									key={keyItem}
									disabled={isEdit && !!item.id}
									control={control}
									label="Nama Item"
									className="flex-1"
									data={itemSelections}
									fieldName={`form.oPoItems.${i}.id_item`}
								/>
							</Cell>
							<Cell>
								<InputDummy
									className="flex-1"
									label="Kode Item"
									byPassValue={oItem?.kode}
									disabled
								/>
							</Cell>
							<Cell>
								<InputDummy
									className="flex-1"
									label="Harga"
									type="decimal"
									byPassValue={oItem?.harga}
									disabled
								/>
							</Cell>
							<Cell className="gap-2">
								<Input
									type="decimal"
									className="flex-1"
									label="Jumlah"
									control={control}
									fieldName={`form.oPoItems.${i}.qty`}
								/>
								<Select
									label="Unit"
									className="flex-1"
									control={control}
									data={selectUnitDataInternal}
									fieldName={`form.oPoItems.${i}.unit`}
								/>
							</Cell>

							<Cell>
								<Button icon="faTrash" onClick={() => removeItem(idItem)} />
							</Cell>
						</Fragment>
					);
				}}
			/>

			<Button type="submit">Submit</Button>
		</div>
	);
}

function RenderPdf(props: RetPoInternal) {
	const {date, nomor_po, oPoItems, oSup, keterangan} = props;

	const {jumlah, ppn, total} = oPoItems.reduce(
		(ret, item) => {
			const {oItem, qty} = item;

			const sum = oItem?.harga! * qty;
			const ppnValue = oItem?.ppn ? sum * ppnMultiply : 0;

			ret.jumlah += sum;
			ret.ppn += ppnValue;
			ret.total += sum + ppnValue;
			return ret;
		},
		{jumlah: 0, ppn: 0, total: 0},
	);

	return (
		<div className="w-full bg-white p-2 flex flex-col gap-2">
			<table className="w-full">
				<tr>
					<BorderTd col>
						<div>{IMIConst.shortName}</div>
						<div>{IMIConst.name}</div>
					</BorderTd>
					<BorderTd>Purchase Order</BorderTd>
					<BorderTd col>
						<div>Tanggal Efektif</div>
						<div>01/01/2011</div>
					</BorderTd>
				</tr>
			</table>

			<div>Tanggal {dateUtils.dateS(date)}</div>

			<Wrapper title="No. P.O">{nomor_po}</Wrapper>
			<Wrapper title="Kepada">
				<div>{oSup?.nama}</div>
				<div>{oSup?.alamat}</div>
			</Wrapper>
			<Wrapper title="Telp">{oSup?.telp!}</Wrapper>

			<table className="w-full">
				<tr>
					<BorderTd>NO.</BorderTd>
					<BorderTd>Nama Barang</BorderTd>
					<BorderTd>Qty</BorderTd>
					<BorderTd>Satuan</BorderTd>
					<BorderTd>Harga /Satuan</BorderTd>
					<BorderTd>Jumlah</BorderTd>
				</tr>
				{oPoItems.map((item, index) => {
					const {qty, unit, oItem} = item;
					const sum = oItem?.harga! * qty;

					return (
						<tr key={item.id}>
							<BorderTd>{index + 1}</BorderTd>
							<BorderTd>{oItem?.nama}</BorderTd>
							<BorderTd>{qty}</BorderTd>
							<BorderTd>{unit}</BorderTd>
							<BorderTd>{numberFormat(oItem?.harga!)}</BorderTd>
							<BorderTd>{numberFormat(sum)}</BorderTd>
						</tr>
					);
				})}
				<tr>
					<BorderTd colSpan={5}>Jumlah</BorderTd>
					<BorderTd>{numberFormat(jumlah)}</BorderTd>
				</tr>
				<tr>
					<BorderTd colSpan={5}>PPn {ppnPercentage}%</BorderTd>
					<BorderTd>{numberFormat(ppn)}</BorderTd>
				</tr>
				<tr>
					<BorderTd colSpan={5}>Total</BorderTd>
					<BorderTd>{numberFormat(total)}</BorderTd>
				</tr>
			</table>

			<Wrapper noColon title="Ket:">
				{keterangan!}
			</Wrapper>
			<div>Atas Perhatian dan Kerjasamanya kami ucapkan terima kasih.</div>

			<div className="w-full flex justify-end">
				<table className="w-2/3">
					<tr>
						<BorderTd center>Prepared</BorderTd>
						<BorderTd center>Checked</BorderTd>
						<BorderTd center>Approved</BorderTd>
					</tr>
					<tr>
						<BorderTd height={75}></BorderTd>
						<BorderTd height={75}></BorderTd>
						<BorderTd height={75}></BorderTd>
					</tr>
					<tr>
						<BorderTd className="text-transparent">.</BorderTd>
						<BorderTd className="text-transparent">.</BorderTd>
						<BorderTd className="text-transparent">.</BorderTd>
					</tr>
				</table>
			</div>

			<div className="text-center">{`${IMIConst.address1}, ${IMIConst.address2}`}</div>
			<div className="text-center">{`Telp : ${IMIConst.phone} Fax : ${IMIConst.fax} e-mail : ${IMIConst.email}`}</div>
		</div>
	);
}
