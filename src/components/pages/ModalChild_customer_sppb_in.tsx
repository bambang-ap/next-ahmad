// FIXME: use unused vars
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */

import {PropsWithChildren, useEffect} from 'react';

import {FormType} from 'pages/app/customer/customer_sppb_in';
import {useWatch} from 'react-hook-form';
import {useRecoilState} from 'recoil';

import {FormProps, TCustomer} from '@appTypes/app.type';
import {
	Button,
	Cells,
	Input,
	Select,
	selectMapper,
	Table,
	Text,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {atomExcludedItem, atomIncludedItem} from '@recoil/atoms';
import {modalTypeParser, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

import {qtyList} from './ModalChild_po';

export function SppbInModalChild({
	control,
	reset,
}: FormProps<FormType, 'control' | 'reset'>) {
	const dataForm = useWatch({control});

	const [excludedItem, setExcludedItem] = useRecoilState(atomExcludedItem);
	const [includedItem, setIncludedItem] = useRecoilState(atomIncludedItem);

	const {
		id_customer = '',
		OrmCustomerPO,
		OrmPOItemSppbIns,
		id_po,
		type,
	} = dataForm;

	const {data: dataCustomer = [], isFetching: isFetchingCustomer} =
		trpc.basic.get.useQuery<any, TCustomer[]>({
			target: CRUD_ENABLED.CUSTOMER,
		});
	const {data: listPo = [], isFetching: isFetchingPo} =
		trpc.sppb.in.po.gett.useQuery({id_customer}, {enabled: !!id_customer});

	const {isPreview, isDelete, isEdit, isPreviewEdit} = modalTypeParser(type);

	useEffect(() => {
		reset(prev => ({...prev, id_customer: OrmCustomerPO?.OrmCustomer?.id}));
	}, [OrmCustomerPO?.OrmCustomer?.id]);

	useEffect(() => {
		return () => {
			setExcludedItem([]);
			setIncludedItem([]);
		};
	}, []);

	if (isDelete) return <Button type="submit">Ya</Button>;

	const selectedPo = listPo.find(e => e.id === id_po);

	function _excludeItem(id: string) {
		setExcludedItem(prev => [...prev, id]);
	}

	function _includeItem(id: string) {
		setExcludedItem(prev => prev.filter(item => item !== id));
	}

	function _excludeItemEdit(id: string) {
		setIncludedItem(prev => prev.filter(item => item !== id));
	}

	function _includeItemEdit(id: string) {
		setIncludedItem(prev => [...prev, id]);
	}

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
					// @ts-ignore
					['Jumlah', qtyList.length],
					// !isPreview && "Action",
				]}
				data={selectedPo?.OrmCustomerPOItems}
				renderItem={({Cell, item}, index) => {
					const selectedItem = OrmPOItemSppbIns?.find(
						e => e.id_item === item.id,
					);

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
							<Cell>
								<Input
									className="flex-1"
									label="Nomor Lot"
									control={control}
									defaultValue={selectedItem?.lot_no}
									fieldName={`po_item.${index}.lot_no`}
								/>
							</Cell>
							{qtyMap(({num, qtyKey, unitKey}) => {
								const unit = item[unitKey];
								if (!unit) return <Cell key={num} />;

								const currentQty =
									item[qtyKey]! -
									(item.totalQty[qtyKey]! ?? 0) +
									(isEdit ? selectedItem?.[qtyKey]! : 0);

								const jumlah = isPreviewEdit
									? selectedItem?.[qtyKey]
									: currentQty;
								const max = isEdit ? item[qtyKey]! - currentQty : currentQty;

								return (
									<Cell>
										<Input
											className="flex-1"
											disabled={isPreview}
											type="decimal"
											control={control}
											shouldUnregister
											label={`Jumlah ${num}`}
											defaultValue={jumlah}
											rightAcc={<Text>{unit}</Text>}
											fieldName={`po_item.${index}.qty${num}`}
											rules={{max: {value: max, message: `max is ${max}`}}}
										/>
									</Cell>
								);
							})}
						</>
					);
				}}
			/>
			{!isPreview && <Button type="submit">Submit</Button>}
		</div>
	);
}

function RenderReAddItem({
	Cell,
	onClick,
	children,
}: PropsWithChildren<Cells & {onClick: NoopVoid}>) {
	return (
		<>
			<Cell colSpan={qtyList.length + 2}>{children}</Cell>
			<Cell>
				<Button onClick={onClick}>Add</Button>
			</Cell>
		</>
	);
}
