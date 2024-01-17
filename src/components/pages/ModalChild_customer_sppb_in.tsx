import {useEffect} from 'react';

import {FormType} from 'pages/app/customer/customer_sppb_in';
import {useWatch} from 'react-hook-form';

import {FormProps, TCustomer} from '@appTypes/app.type';
import {Button, Input, Select, selectMapper, Table, Text} from '@components';
import {CRUD_ENABLED} from '@enum';
import {modalTypeParser, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

export function SppbInModalChild({
	control,
	reset,
}: FormProps<FormType, 'control' | 'reset'>) {
	const dataForm = useWatch({control});

	const {
		id_customer = '',
		dPo: OrmCustomerPO,
		dInItems: OrmPOItemSppbIns,
		id_po,
		type,
		po_item: po_item_form,
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

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<Select
					disabled={isPreviewEdit}
					key={id_customer}
					className="flex-1"
					control={control}
					fieldName="id_customer"
					label="Customer"
					isLoading={isFetchingCustomer}
					data={selectMapper(dataCustomer, 'id', 'name')}
				/>
				<Select
					key={`${isFetchingPo}${id_customer}${id_po}`}
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
					'Nomor Lot',
					'Jumlah',
					!isPreview && 'Action',
				]}
				data={selectedPo?.OrmCustomerPOItems}
				renderItem={({Cell, item}, index) => {
					if (isAdd && item.isClosed) return false;

					const selectedItem = OrmPOItemSppbIns?.find(
						e => e.id_item === item.id,
					);

					if (!selectedItem && item.isClosed) return false;

					const included = isAdd ? true : !!selectedItem;

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
									if (!unit) return <Cell key={num} />;

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
							<Cell>
								<Input
									shouldUnregister
									type="checkbox"
									label="Included"
									className="flex-1"
									control={control}
									defaultValue={included}
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
