import {useEffect} from 'react';

import objectPath from 'object-path';
import {FormType} from 'pages/app/customer/customer_sppb_in';
import {useWatch} from 'react-hook-form';

import {
	DiscountRenderer,
	getDiscValue,
	RenderTotalHarga,
} from '@appComponent/DiscountSelection';
import {SelectCustomer} from '@appComponent/PageTable/SelectCustomer';
import {FormProps, TCustomer} from '@appTypes/app.type';
import {
	Button,
	Input,
	InputDummy,
	Select,
	selectMapper,
	Table,
	Text,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {modalTypeParser, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

export function SppbInModalChild({
	control,
	reset,
	setValue,
}: FormProps<FormType, 'control' | 'reset' | 'setValue'>) {
	const dataForm = useWatch({control});

	const {
		id_customer = '',
		dPo: OrmCustomerPO,
		dInItems: OrmPOItemSppbIns,
		po_item,
		id_po,
		type,
	} = dataForm;

	const {data: dataCustomer = [], isFetching: isFetchingCustomer} =
		trpc.basic.get.useQuery<any, TCustomer[]>({
			target: CRUD_ENABLED.CUSTOMER,
		});
	const {data: listPo = [], isFetching: isFetchingPo} =
		trpc.sppb.in.po.gett.useQuery({id_customer}, {enabled: !!id_customer});

	const {isPreview, isDelete, isAdd, isPreviewEdit} = modalTypeParser(type);

	useEffect(() => {
		reset(prev => ({...prev, id_customer: OrmCustomerPO?.dCust?.id}));
	}, [OrmCustomerPO?.dCust?.id]);

	if (isDelete) return <Button type="submit">Ya</Button>;

	const selectedPo = listPo.find(e => e.id === id_po);
	const keyPo = `${id_customer}${id_po}`;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<SelectCustomer
					disabled={isPreviewEdit}
					key={id_customer}
					className="flex-1"
					control={control}
					fieldName="id_customer"
					isLoading={isFetchingCustomer}
					data={dataCustomer}
				/>
				<Select
					key={keyPo}
					className="flex-1"
					disabled={isPreviewEdit}
					control={control}
					fieldName="id_po"
					label="PO"
					isLoading={isFetchingPo}
					firstOption="- Pilih PO -"
					data={selectMapper(
						isPreviewEdit ? listPo : listPo.filter(e => !e.isClosed),
						'id',
						'nomor_po',
					)}
				/>
				<Input
					className="flex-1"
					disabled={isPreview}
					control={control}
					fieldName="nomor_surat"
					placeholder="Nomor surat jalan"
					label="Nomor Surat"
				/>
				<Input
					className="flex-1"
					disabled={isPreview}
					control={control}
					fieldName="tgl"
					type="date"
					placeholder="Tanggal surat jalan"
					label="Tanggal"
				/>
			</div>

			<Table
				header={[
					'Kode Item',
					'Nama Item',
					'Harga',
					'Nomor Lot',
					'Jumlah',
					'Total',
					!isPreview && 'Action',
				]}
				data={selectedPo?.OrmCustomerPOItems ?? []}
				renderItemEach={({Cell, isLast}, _, items) => {
					if (!isLast) return false;

					return (
						<RenderTotalHarga
							Cell={Cell}
							colSpan={5}
							items={items}
							calculate={(item, index) => {
								const qty3 = objectPath.get<number>(
									dataForm,
									`po_item.${index}.qty3`,
									0,
								);

								const {totalPrice} = getDiscValue(
									item.discount_type,
									item.discount,
									(item.harga ?? 0) * qty3,
								);

								return totalPrice;
							}}
						/>
					);
				}}
				renderItem={({Cell, item}, index) => {
					if (isAdd && item.isClosed) return false;

					const selectedItem = OrmPOItemSppbIns?.find(
						e => e.id_item === item.id,
					);

					if (!selectedItem && item.isClosed) return false;

					const itemIncluded = po_item?.[index]?.included;
					const includedDefaultValue = isAdd ? true : !!selectedItem;
					const included =
						itemIncluded === undefined ? includedDefaultValue : itemIncluded;

					return (
						<>
							<Input
								className="hidden"
								control={control}
								shouldUnregister
								defaultValue={item.id}
								fieldName={`po_item.${index}.id_item`}
							/>
							<Input
								className="hidden"
								control={control}
								shouldUnregister
								defaultValue={item.master_item_id}
								fieldName={`po_item.${index}.master_item_id`}
							/>
							<Input
								className="hidden"
								control={control}
								shouldUnregister
								defaultValue={selectedItem?.id}
								fieldName={`po_item.${index}.id`}
							/>
							<Cell>{item.OrmMasterItem.kode_item}</Cell>
							<Cell>{item.OrmMasterItem.name}</Cell>
							<Cell hidden={!included}>
								<InputDummy
									className="flex-1"
									disabled
									label="Harga"
									byPassValue={item.harga}
								/>
							</Cell>
							<Cell hidden={!included}>
								<Input
									className="flex-1"
									label="Nomor Lot"
									control={control}
									defaultValue={!included ? '' : selectedItem?.lot_no}
									fieldName={`po_item.${index}.lot_no`}
								/>
							</Cell>
							<Cell hidden={!included} className="gap-2">
								{qtyMap(({num, qtyKey, unitKey}) => {
									const unit = item[unitKey];
									if (!unit) return null;

									const qty = item[qtyKey] ?? 0;
									const qtyItem = selectedItem?.[qtyKey];
									const qtyLeft = item.totalQty?.[qtyKey] ?? 0;

									const max = qty - qtyLeft + (qtyItem ?? 0);

									const jumlah = qtyItem ?? max;

									return (
										<>
											<Input
												className="flex-1"
												disabled={isPreview}
												type="decimal"
												control={control}
												label={`Jumlah ${num}`}
												defaultValue={jumlah}
												rightAcc={<Text>{unit}</Text>}
												fieldName={`po_item.${index}.qty${num}`}
												rules={{max: {value: max, message: `max is ${max}`}}}
											/>
										</>
									);
								})}
							</Cell>

							<Cell hidden={!included} className="gap-2">
								<DiscountRenderer
									control={control}
									setValue={setValue}
									qtyPrice={[`po_item.${index}.qty3`, item.harga!]}
									type={[item.discount_type!, `po_item.${index}.discount_type`]}
									discount={[item.discount!, `po_item.${index}.discount`]}
								/>
							</Cell>

							<Cell>
								<Input
									shouldUnregister
									type="checkbox"
									className="flex-1"
									control={control}
									defaultValue={includedDefaultValue}
									fieldName={`po_item.${index}.included`}
									renderChildren={v => (
										<Button icon={v ? 'faTrash' : 'faPlus'} />
									)}
								/>
							</Cell>
						</>
					);
				}}
			/>
			{!isPreview && <Button type="submit">Submit</Button>}
		</div>
	);
}
