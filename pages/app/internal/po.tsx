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
	cuttingLineClassName2,
	IMIConst,
	paperF4,
	ppnMultiply,
	ppnPercentage,
	selectUnitDataInternal,
} from '@constants';
import {DiscType} from '@enum';
import {getLayout} from '@hoc';
import {useSession, useTableFilterComponent} from '@hooks';
import {TableBorder} from '@pageComponent/sppbOut_GenerateQR';
import type {RetPoInternal} from '@trpc/routers/internal/poRouters';
import {
	classNames,
	dateUtils,
	formParser,
	modalTypeParser,
	moment,
	numberFormat,
	renderIndex,
	renderItemAsIs,
} from '@utils';
import {trpc} from '@utils/trpc';

type FormType = {
	form: SPoUpsert;
	type: ModalTypeSelect;
	selectedIds: MyObject<boolean>;
};

InternalPo.getLayout = getLayout;

const paperWidth = 1600;

export default function InternalPo() {
	const modalRef = useRef<ModalRef>(null);
	const {control, reset, resetField, watch, handleSubmit, clearErrors} =
		useForm<FormType>();
	const dataForm = watch();

	const {modalTitle, isPreview, isDelete, selectedIds, property, enabled} =
		formParser(dataForm, {
			pageName: 'PO',
			property: 'selectedIds',
		});

	const {component, refetch, mutateOpts} = useTableFilterComponent({
		reset,
		control,
		property,
		exportRenderItem: renderItemAsIs,
		exportUseQuery: () =>
			trpc.export.internal.po.useQuery({ids: selectedIds}, {enabled}),
		genPdfOptions: {
			tagId: 'internal-po',
			filename: 'internal-po',
			splitPagePer: 2,
			width: paperWidth,
			orientation: 'l',
			paperSize: paperF4,
			renderItem: item => (
				<div className={classNames('w-1/2', cuttingLineClassName2)}>
					<RenderPdf {...item} />
				</div>
			),
			useQuery: () =>
				trpc.internal.po.pdf.useQuery({ids: selectedIds}, {enabled}),
		},
		header: [
			'No',
			'Nama Supplier',
			'Nomor PO',
			'Date',
			'Due Date',
			'Status',
			'Keterangan',
			'Action',
		],
		topComponent: <Button onClick={() => showModal({type: 'add'})}>Add</Button>,
		useQuery: form => trpc.internal.po.get.useQuery(form),
		renderItem: ({Cell, CellSelect, item}, index) => {
			const {oSup: dSSUp, date, due_date, keterangan, status} = item;

			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{index + 1}</Cell>
					<Cell>{dSSUp?.nama}</Cell>
					<Cell>{renderIndex(item)}</Cell>
					<Cell>{date}</Cell>
					<Cell>{due_date}</Cell>
					<Cell>{status}</Cell>
					<Cell>{keterangan}</Cell>
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
					<RenderModal
						reset={reset}
						control={control}
						resetField={resetField}
					/>
				</Form>
			</Modal>
		</>
	);
}

function RenderModal({
	reset,
	control,
}: // resetField,
FormProps<FormType, 'control' | 'reset' | 'resetField'>) {
	const {type, form} = useWatch({control});

	const {isDelete, isEdit, isPreviewEdit} = modalTypeParser(type);
	const {data: dataSup} = trpc.internal.supplier.get.useQuery({
		limit: 9999,
	});
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

			{isPreviewEdit && (
				<InputDummy
					disabled
					className="flex-1"
					label="Nomor PO"
					// @ts-ignore
					byPassValue={renderIndex(form!)}
				/>
			)}

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

			{/* <DiscountSelection
				control={control}
				resetField={resetField}
				type="form.discount_type"
				discount="form.discount"
			/> */}

			<Input control={control} fieldName="form.keterangan" label="Keterangan" />

			<Table
				topComponent={
					<Button className="w-full" onClick={addItem}>
						{`Tambah Item (Max ${maxItem} Items / page)`}
					</Button>
				}
				data={form?.oPoItems}
				// renderItemEach={({Cell}, i) => {
				// 	return (
				// 		<Cell colSpan={5} className="items-center gap-2">
				// 			<DiscountSelection
				// 				control={control}
				// 				resetField={resetField}
				// 				discount={`form.oPoItems.${i}.discount`}
				// 				type={`form.oPoItems.${i}.discount_type`}
				// 			/>
				// 		</Cell>
				// 	);
				// }}
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
							<Cell width="5%">
								<InputDummy byPassValue={i + 1} label="No" />
							</Cell>
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

							<Cell rowSpan={2}>
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

const maxItem = 10;

function aa(price: number, type?: DiscType, value?: number): [number, number] {
	if (!type) return [0, 0];

	if (type === DiscType.Value) return [value!, price - value!];

	const s = price * (0.01 * value!);
	return [s, price - s];
}

function RenderPdf(props: RetPoInternal) {
	// const [width, height] = paperSizeCalculator(paperWidth, {minus: 45});
	const {
		data: {user},
	} = useSession();
	const {date, oPoItems, oSup, keterangan} = props;

	const {jumlah, ppn, /* disc ,*/ total} = oPoItems.reduce(
		(ret, item) => {
			const {oItem, qty, discount, discount_type} = item;

			const sum = oItem?.harga! * qty;
			const ppnValue = oItem?.ppn ? sum * ppnMultiply : 0;
			const [discVal] = aa(sum, discount_type!, discount!);

			ret.jumlah += sum;
			ret.ppn += ppnValue;
			ret.total += sum + ppnValue;
			ret.disc += discVal;
			return ret;
		},
		{jumlah: 0, ppn: 0, total: 0, disc: 0},
	);

	const itemRender = oPoItems.concat(
		// @ts-ignore
		Array.from({length: maxItem - oPoItems.length}).fill(null),
	);

	return (
		<div
			/* style={{width, height}} */ className="w-full h-full bg-white p-4 flex flex-col gap-2">
			<div className="flex flex-col flex-1 gap-2">
				<TableBorder className="w-full">
					<tr>
						<BorderTd col>
							<div className="text-red-500">{IMIConst.shortName}</div>
							<div>{IMIConst.name}</div>
						</BorderTd>
						<BorderTd className="uppercase" center colSpan={2}>
							Purchase Order
						</BorderTd>
						<BorderTd col>
							<div>Tanggal Efektif</div>
							<div>01/01/2011</div>
						</BorderTd>
					</tr>
					<tr>
						<BorderTd center>IMI-FORM-PURC-01-04</BorderTd>
						<BorderTd center>Revisi : 0</BorderTd>
						<BorderTd center>Terbit : A</BorderTd>
						<BorderTd center>Halaman 1 dari 1</BorderTd>
					</tr>
				</TableBorder>

				<div className="flex justify-between">
					<div className="flex flex-1 flex-col gap-1 mb-2">
						<Wrapper noPadding title="No. P.O">
							{renderIndex(props)}
						</Wrapper>
						<Wrapper noPadding title="Kepada">
							<div>{oSup?.nama}</div>
							<div>{oSup?.alamat}</div>
						</Wrapper>
						<Wrapper noPadding title="Telp">
							{oSup?.telp!}
						</Wrapper>
					</div>

					<div>Tanggal {dateUtils.dateS(date)}</div>
				</div>

				<TableBorder className="w-full">
					<tr>
						<BorderTd>NO.</BorderTd>
						<BorderTd>Nama Barang</BorderTd>
						<BorderTd>Qty</BorderTd>
						<BorderTd>Satuan</BorderTd>
						<BorderTd>Harga /Satuan</BorderTd>
						<BorderTd>Jumlah</BorderTd>
					</tr>
					{itemRender.map((item, index) => {
						if (!item) {
							return (
								<tr key={uuid()}>
									<BorderTd className="text-transparent">null</BorderTd>
									<BorderTd />
									<BorderTd />
									<BorderTd />
									<BorderTd />
									<BorderTd />
									{/* <BorderTd />
									<BorderTd /> */}
								</tr>
							);
						}

						const {qty, unit, oItem /* discount, discount_type */} = item;
						const sum = oItem?.harga! * qty;
						// const [disc] = aa(sum, discount_type!, discount!);

						return (
							<tr key={item.id}>
								<BorderTd>{index + 1}</BorderTd>
								<BorderTd>{oItem?.nama}</BorderTd>
								<BorderTd>{qty}</BorderTd>
								<BorderTd>{unit}</BorderTd>
								<BorderTd>{numberFormat(oItem?.harga!)}</BorderTd>
								<BorderTd>{numberFormat(sum)}</BorderTd>
								{/* <BorderTd>{numberFormat(disc)}</BorderTd>
								<BorderTd>{numberFormat(sum - disc)}</BorderTd> */}
							</tr>
						);
					})}
					<tr>
						<BorderTd colSpan={5}>Jumlah</BorderTd>
						<BorderTd>{numberFormat(jumlah)}</BorderTd>
					</tr>
					{/* <tr>
						<BorderTd colSpan={5}>Diskon</BorderTd>
						<BorderTd>{numberFormat(disc)}</BorderTd>
					</tr> */}
					<tr>
						<BorderTd colSpan={5}>PPn {ppnPercentage}%</BorderTd>
						<BorderTd>{numberFormat(ppn)}</BorderTd>
					</tr>
					<tr>
						<BorderTd colSpan={5}>Total</BorderTd>
						<BorderTd>{numberFormat(total)}</BorderTd>
					</tr>
				</TableBorder>
			</div>

			<Wrapper sizes={['w-1/6']} noColon noPadding title="Ket:">
				{keterangan!}
			</Wrapper>

			<div className="mb-2">
				Atas Perhatian dan Kerjasamanya kami ucapkan terima kasih.
			</div>

			<div className="w-full flex justify-end">
				<TableBorder className="w-2/3">
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
						<BorderTd center>{user?.name}</BorderTd>
						<BorderTd className="text-transparent">.</BorderTd>
						<BorderTd className="text-transparent">.</BorderTd>
					</tr>
				</TableBorder>
			</div>

			<div className="text-center text-sm">{`${IMIConst.address1}, ${IMIConst.address2}`}</div>
			<div className="text-center text-sm">{`Telp : ${IMIConst.phone} Fax : ${IMIConst.fax} e-mail : ${IMIConst.email}`}</div>
		</div>
	);
}
