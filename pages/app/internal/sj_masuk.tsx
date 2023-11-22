import {FormEventHandler, Fragment, useRef, useState} from 'react';

import {useForm, useWatch} from 'react-hook-form';

import {Wrapper} from '@appComponent/Wrapper';
import {FormProps, ModalTypeSelect} from '@appTypes/app.type';
import {SInUpsert} from '@appTypes/app.zod';
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
	Text,
} from '@components';
import {IMIConst, ppnPercentage, selectUnitDataInternal} from '@constants';
import {getLayout} from '@hoc';
import {useTableFilterComponent} from '@hooks';
import type {InRetOutput} from '@trpc/routers/internal/inRouters';
import {
	dateUtils,
	formParser,
	modalTypeParser,
	numberFormat,
	ppnParser,
	renderItemAsIs,
} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SInUpsert;
	isSelection: boolean;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalSiIn.getLayout = getLayout;

export default function InternalSiIn() {
	const modalRef = useRef<ModalRef>(null);
	const [dta, onDataChanged] = useState<InRetOutput[]>([]);
	const {control, reset, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete, selectedIds, property} = formParser(
		dataForm,
		{
			pageName: 'Surat Jalan Masuk',
			property: 'selectedIds',
		},
	);

	const {component, refetch, mutateOpts} = useTableFilterComponent({
		reset,
		control,
		property,
		onDataChanged,
		exportRenderItem: renderItemAsIs,
		exportUseQuery: () =>
			trpc.export.internal.sj_in.useQuery({ids: selectedIds}),
		genPdfOptions: {
			debug: true,
			width: 750,
			splitPagePer: 1,
			tagId: 'internal-po',
			renderItem: item => <RenderPdf {...item} />,
			useQuery: () => dta.filter(e => selectedIds.includes(e.id!)),
		},
		header: ['No', 'Nama Supplier', 'Nomor PO', 'Date', 'Action'],
		useQuery: form => trpc.internal.in.get.useQuery(form),
		topComponent: (
			<>
				<Button onClick={() => showModal({type: 'add', isSelection: true})}>
					Tambah SJ PO
				</Button>
				<Button onClick={() => showModal({type: 'add'})}>
					Tambah SJ Non PO
				</Button>
			</>
		),
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {date, oPo} = item;
			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{item.oSup?.nama}</Cell>
					<Cell>{oPo?.nomor_po}</Cell>
					<Cell>{date}</Cell>
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

	const {mutateAsync: mutateManual} =
		trpc.internal.in.upsert_manual.useMutation(mutateOpts);
	const {mutateAsync: mutateUpsert} =
		trpc.internal.in.upsert.useMutation(mutateOpts);
	const {mutateAsync: mutateDelete} =
		trpc.internal.in.delete.useMutation(mutateOpts);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(async value => {
			const {isSelection: selct, form} = value;
			if (isDelete) return mutateDelete({id: value.form.id!}, {onSuccess});
			else {
				const isSelection = selct || !!form?.id_po;

				if (isSelection) return mutateUpsert(value.form, {onSuccess});
				else
					return mutateManual(
						{
							// @ts-ignore
							oInItems: form.oInItems,
							sup_id: form.sup_id,
							date: form.date,
							id: form?.id,
						},
						{onSuccess},
					);
			}

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
	const {type, form, isSelection: selct} = useWatch({control});

	const {data: dataSup} = trpc.internal.supplier.get.useQuery({
		limit: 9999,
	});
	const {data: dataPo} = trpc.internal.po.get.useQuery(
		{limit: 9999, id: form?.sup_id},
		{enabled: !!form?.sup_id},
	);
	const {data: poItems} = trpc.internal.in.get_closed.useQuery(
		{id: form?.id_po!},
		{enabled: !!form?.id_po},
	);

	const {isDelete, isEdit} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Hapus</Button>;

	const isSelection = selct || !!form?.id_po;
	const selectedPo = dataPo?.rows.find(e => e.id === form?.id_po);
	const selectedItems = form?.oInItems;
	const selectedIdItems =
		selectedItems?.map(e => e.id_item).filter(Boolean) ?? [];

	const {keyPo, keySup} = {
		keySup: `${!!dataSup}${form?.sup_id}`,
		get keyPo() {
			return `${this.keySup}${!!selectedPo}${form?.id_po}`;
		},
	};

	function addItem() {
		reset(prev => {
			const oInItems = prev.form.oInItems?.slice?.() ?? [];
			oInItems.push({temp_id: uuid()} as typeof oInItems[number]);
			return {...prev, form: {...prev.form, oInItems}};
		});
	}

	function removeItem(id: string) {
		reset(prev => {
			const oItems = prev.form.oInItems?.slice?.() ?? [];
			const index = oItems.findIndex(e => e.id === id || e.temp_id === id);

			return {
				...prev,
				form: {...prev.form, oInItems: oItems.remove(index)},
			};
		});
	}

	return (
		<div className="flex flex-col gap-2">
			<Select
				key={keySup}
				label="Supplier"
				control={control}
				fieldName="form.sup_id"
				data={selectMapper(dataSup?.rows ?? [], 'id', 'nama')}
			/>

			{isSelection && (
				<Select
					key={keyPo}
					label="PO"
					control={control}
					fieldName="form.id_po"
					data={selectMapper(dataPo?.rows ?? [], 'id', 'nomor_po')}
				/>
			)}

			<Input type="date" control={control} fieldName="form.date" label="Date" />

			<Table
				topComponent={
					<Button className="w-full" onClick={addItem}>
						Tambah Item
					</Button>
				}
				data={form?.oInItems}
				renderItem={({Cell, item}, i) => {
					const idItem = item.id ?? item.temp_id!;
					const poItem = selectedPo?.oPoItems.find(e => e.id === item.id_item);
					const selPoItem = poItems?.find(e => e.id === poItem?.id);
					const inItem = selPoItem?.oInItems.find(e => e.id === idItem);
					const oItem = poItem?.oItem;

					const itemSelections = selectMapper(
						selectedPo?.oPoItems ?? [],
						'id',
						'oItem.nama',
					).filter(
						e => e.value === item.id_item || !selectedIdItems.includes(e.value),
					);

					const defaultValue = selPoItem?.max;
					const max = isEdit ? defaultValue! + inItem?.qty! : defaultValue;
					const keyItem = `${keyPo}${!!poItem}${idItem}${defaultValue}`;
					const keyQty = `${keyItem}${defaultValue}`;

					return (
						<Fragment key={idItem}>
							<Input
								hidden
								control={control}
								fieldName={`form.oInItems.${i}.id`}
							/>
							<Input
								hidden
								control={control}
								defaultValue={selPoItem}
								fieldName={`form.oInItems.${i}.oPoItem`}
							/>
							<Cell width="30%">
								{isSelection ? (
									<Select
										key={keyItem}
										className="flex-1"
										label="Nama Item"
										control={control}
										data={itemSelections}
										fieldName={`form.oInItems.${i}.id_item`}
									/>
								) : (
									<Input
										control={control}
										className="flex-1"
										label="Nama Item"
										fieldName={`form.oInItems.${i}.nama`}
									/>
								)}
							</Cell>
							<Cell>
								{isSelection ? (
									<InputDummy
										className="flex-1"
										label="Kode Item"
										byPassValue={oItem?.kode}
										disabled
									/>
								) : (
									<Input
										control={control}
										className="flex-1"
										label="Kode Item"
										fieldName={`form.oInItems.${i}.kode`}
									/>
								)}
							</Cell>
							<Cell>
								{isSelection ? (
									<InputDummy
										className="flex-1"
										label="Harga"
										type="decimal"
										byPassValue={oItem?.harga}
										disabled
									/>
								) : (
									<Input
										type="decimal"
										label="Harga"
										control={control}
										className="flex-1"
										fieldName={`form.oInItems.${i}.harga`}
									/>
								)}
							</Cell>
							<Cell className="gap-2">
								{isSelection ? (
									<Input
										shouldUnregister
										key={keyQty}
										type="decimal"
										className="flex-1"
										label="Jumlah"
										control={control}
										defaultValue={defaultValue}
										fieldName={`form.oInItems.${i}.qty`}
										rightAcc={<Text>{poItem?.unit}</Text>}
										rules={{max: {value: max!, message: `Max is ${max}`}}}
									/>
								) : (
									<>
										<Input
											type="decimal"
											control={control}
											className="flex-1"
											label="Qty"
											fieldName={`form.oInItems.${i}.qty`}
										/>
										<Select
											label="Unit"
											className="flex-1"
											control={control}
											data={selectUnitDataInternal}
											fieldName={`form.oInItems.${i}.unit`}
										/>
									</>
								)}
							</Cell>

							<Cell>
								<Input
									control={control}
									className="flex-1"
									label="Keterangan"
									fieldName={`form.oInItems.${i}.keterangan`}
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

function RenderPdf(props: InRetOutput) {
	let jumlahValue = 0,
		ppnValue = 0;

	const {date, oInItems, oPo, no_lpb, oSup} = props;

	const maxTableRow = 7;
	const headers = [
		'Kode',
		'Jumlah',
		'Satuan',
		'Nama Barang & Spesifikasi',
		'Hrg. / Stn.',
		'Total',
		'Keterangan',
	];

	return (
		<div className="w-full bg-white p-4 flex flex-col gap-2">
			<table className="w-full">
				<tr>
					<BorderTd col>
						<div className="text-red-500">{IMIConst.shortName}</div>
						<div>{IMIConst.name}</div>
					</BorderTd>
					<BorderTd className="uppercase" center colSpan={2}>
						Purchase Order
					</BorderTd>
					<BorderTd col />
				</tr>
				<tr>
					<BorderTd center>IMI-FORM-PURC-01-08</BorderTd>
					<BorderTd className="justify-between" center>
						<div>Revisi : 0</div>
						<div>Terbit : A</div>
					</BorderTd>
					<BorderTd center>Hal 1 dari 1</BorderTd>
					<BorderTd center>Tgl. Eff. 01/01/2011</BorderTd>
				</tr>
			</table>

			<div className="flex">
				<div className="flex-1">
					<Wrapper smallPadding title="Tanggal">
						{dateUtils.dateS(date)!}
					</Wrapper>
					<Wrapper smallPadding title="Supplier">
						{oSup?.nama}
					</Wrapper>
				</div>
				<div className="flex-1">
					<Wrapper smallPadding title="No. LPB">
						{no_lpb!}
					</Wrapper>
					<Wrapper smallPadding title="No. PO">
						{oPo?.nomor_po}
					</Wrapper>
				</div>
			</div>

			<table>
				<tr>
					{headers.map(header => (
						<BorderTd key={header} center>
							{header}
						</BorderTd>
					))}
				</tr>
				{oInItems.map(item => {
					const {id, qty, harga, unit, kode, nama, oPoItem, keterangan} = item;
					const {oItem} = oPoItem ?? {};

					const nameItem = oItem?.nama ?? nama;
					const unitItem = oPoItem?.unit ?? unit;
					const kodeItem = oItem?.kode ?? kode;
					const hargaItem = parseFloat((oItem?.harga ?? harga)?.toString()!);
					const jumlah = hargaItem * qty;

					jumlahValue += jumlah;
					ppnValue += ppnParser(!!oItem?.ppn, hargaItem, qty);

					return (
						<tr key={id}>
							<BorderTd center>{kodeItem}</BorderTd>
							<BorderTd center>{qty}</BorderTd>
							<BorderTd center>{unitItem}</BorderTd>
							<BorderTd>{nameItem}</BorderTd>
							<BorderTd>{numberFormat(hargaItem, false)}</BorderTd>
							<BorderTd>{numberFormat(jumlah, false)}</BorderTd>
							<BorderTd>{keterangan}</BorderTd>
						</tr>
					);
				})}
				{Array.from({length: maxTableRow - oInItems.length}).map(() => (
					<>
						<tr>
							{headers.map(header => (
								<BorderTd key={header} className="text-transparent">
									{header}
								</BorderTd>
							))}
						</tr>
					</>
				))}
				<tr>
					<BorderTd colSpan={4} />
					<BorderTd>Jumlah</BorderTd>
					<BorderTd>{numberFormat(jumlahValue, false)}</BorderTd>
					<BorderTd />
				</tr>
				<tr>
					<BorderTd colSpan={4} />
					<BorderTd>{`PPn ${ppnPercentage}%`}</BorderTd>
					<BorderTd>{numberFormat(ppnValue, false)}</BorderTd>
					<BorderTd />
				</tr>
				<tr>
					<BorderTd colSpan={4} />
					<BorderTd>Total</BorderTd>
					<BorderTd>{numberFormat(jumlahValue + ppnValue, false)}</BorderTd>
					<BorderTd />
				</tr>
			</table>

			<div className="w-full mt-4 flex">
				<div className="flex flex-col flex-1 items-center">
					<div>Diperiksa</div>
					<div className="h-16"></div>
					<div>( ............................ )</div>
				</div>
				<div className="flex flex-col flex-1 items-center">
					<div>Yang Menyerahkan</div>
					<div className="h-16"></div>
					<div>( ............................ )</div>
				</div>
				<div className="flex flex-col flex-1 items-center">
					<div>Dibuat</div>
					<div className="h-16"></div>
					<div>( Bag. Gudang )</div>
				</div>
			</div>
		</div>
	);
}
