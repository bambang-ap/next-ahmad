import {PropsWithChildren, useEffect} from 'react';

import {Control, useWatch} from 'react-hook-form';
import {useRecoilState} from 'recoil';

import {
	Button,
	Cells,
	Input,
	Select,
	selectMapper,
	Table,
	Text,
} from '@components';
import {atomExcludedItem, atomIncludedItem} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

import {FormType} from '.';
import {qtyList} from '../po/ModalChild';

export function ModalChild({control}: {control: Control<FormType>}) {
	const [excludedItem, setExcludedItem] = useRecoilState(atomExcludedItem);
	const [includedItem, setIncludedItem] = useRecoilState(atomIncludedItem);
	const [modalType, idSppbIn, idPo] = useWatch({
		control,
		name: ['type', 'id', 'id_po'],
	});

	const {data: dataSppbIn} = trpc.sppb.get.useQuery({type: 'sppb_in'});
	const {data: listPo = []} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});

	const isEdit = modalType === 'edit';
	const isPreview = modalType === 'preview';
	const isDelete = modalType === 'delete';
	const isPreviewEdit = isEdit || isPreview;

	useEffect(() => {
		return () => {
			setExcludedItem([]);
			setIncludedItem([]);
		};
	}, []);

	if (isDelete) return <Button type="submit">Ya</Button>;

	const selectedPo = listPo?.find(e => e.id === idPo);
	const selectedSppbIn = dataSppbIn?.filter(e => e.id_po === idPo);
	const selectedSppbInn = dataSppbIn?.find(e => e.id === idSppbIn);

	function excludeItem(id: string) {
		setExcludedItem(prev => [...prev, id]);
	}

	function includeItem(id: string) {
		setExcludedItem(prev => prev.filter(item => item !== id));
	}

	function excludeItemEdit(id: string) {
		setIncludedItem(prev => prev.filter(item => item !== id));
	}

	function includeItemEdit(id: string) {
		setIncludedItem(prev => [...prev, id]);
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<Select
					className="flex-1"
					disabled={isPreviewEdit}
					control={control}
					fieldName="id_po"
					firstOption="- Pilih PO -"
					data={selectMapper(
						isPreviewEdit ? listPo : listPo?.filter(e => !e.isClosed),
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
				/>
				<Input
					className="flex-1"
					disabled={isPreview}
					control={control}
					fieldName="tgl"
					type="date"
					placeholder="Tanggal surat jalan"
				/>
			</div>

			<Table
				header={[
					'Kode Item',
					'Nama Item',
					['Jumlah', qtyList.length],
					!isPreview && 'Action',
				]}
				data={selectedPo?.po_item}
				renderItem={({Cell, item}, index) => {
					const sppbItems =
						selectedSppbIn?.map(sppb =>
							sppb.items.find(itemm => itemm.id_item === item.id),
						) ?? [];
					const selectedSppbItem = selectedSppbInn?.items.find(
						itemmm => itemmm?.id_item === item?.id,
					);

					const isOnEditModal = !selectedSppbItem && isEdit;
					const isOnPreviewModal = !selectedSppbItem && isPreview;

					if (isOnPreviewModal || (item.isClosed && !isPreviewEdit)) {
						return false;
					}

					if (excludedItem.includes(item.id)) {
						return (
							<RenderReAddItem Cell={Cell} onClick={() => includeItem(item.id)}>
								{item.kode_item}
							</RenderReAddItem>
						);
					}

					if (isOnEditModal && !includedItem.includes(item.id)) {
						if (item.isClosed) return false;

						return (
							<RenderReAddItem
								Cell={Cell}
								onClick={() => includeItemEdit(item.id)}>
								{item.kode_item}
							</RenderReAddItem>
						);
					}

					const assignedQty = qtyList.reduce<Record<string, number>>(
						(ret, num) => {
							const key = `qty${num}` as const;
							const qty = item?.[key] as number;

							if (!ret[key]) ret[key] = qty;

							sppbItems.forEach(item => {
								if (item?.id_sppb_in !== idSppbIn && item?.[key]) {
									ret[key] -= item[key];
								}
							});

							return ret;
						},
						{},
					);

					return (
						<>
							<Input
								className="!hidden"
								control={control}
								shouldUnregister
								defaultValue={item.id}
								fieldName={`po_item.${index}.id_item`}
							/>
							<Input
								className="!hidden"
								control={control}
								shouldUnregister
								defaultValue={selectedSppbItem?.id}
								fieldName={`po_item.${index}.id`}
							/>
							<Cell>{item.kode_item}</Cell>
							<Cell>{item.name}</Cell>

							{qtyList.map(num => {
								const unit = item[`unit${num}`];

								if (!unit) return <Cell key={num} />;

								return (
									<Cell key={num}>
										<Input
											className="flex-1"
											disabled={isPreview}
											type="number"
											control={control}
											shouldUnregister
											fieldName={`po_item.${index}.qty${num}`}
											rightAcc={<Text>{unit}</Text>}
											rules={{
												max: {
													value: assignedQty[`qty${num}`],
													message: `max is ${assignedQty[`qty${num}`]}`,
												},
											}}
											defaultValue={
												isPreviewEdit
													? selectedSppbItem?.[`qty${num}`] ||
													  assignedQty[`qty${num}`]
													: assignedQty[`qty${num}`]
											}
										/>
									</Cell>
								);
							})}

							{!isPreview && (
								<Cell>
									<Button
										onClick={() =>
											isOnEditModal
												? excludeItemEdit(item.id)
												: excludeItem(item.id)
										}>
										Delete
									</Button>
								</Cell>
							)}
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
