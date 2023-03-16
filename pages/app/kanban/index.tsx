import {FormEventHandler, useEffect, useRef} from 'react';

import {Control, useForm, UseFormReset, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TInstruksiKanban,
	TKanbanUpsert,
	TMesin,
} from '@appTypes/app.zod';
import {
	Button,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {classNames} from '@utils';
import {trpc} from '@utils/trpc';

import {qtyList} from '../customer/po/ModalChild';

Kanban.getLayout = getLayout;

type FormType = TKanbanUpsert & {
	type: ModalTypePreview;
	id_customer: string;
	temp_id_item: string;
};

export default function Kanban() {
	const modalRef = useRef<ModalRef>(null);
	const {control, watch, reset, clearErrors, handleSubmit} =
		useForm<FormType>();
	const {data, refetch} = trpc.kanban.get.useQuery({type: 'kanban'});
	const {mutate: mutateUpsert} = trpc.kanban.upsert.useMutation();

	const [mesinId] = watch(['mesin_id']);

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(({type, ...rest}) => {
			switch (type) {
				case 'add':
				case 'edit':
					return mutateUpsert(rest, {onSuccess});
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
		initValue?: Partial<Omit<FormType, 'type'>>,
	) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	useEffect(() => {
		reset(({instruksi_id, ...prev}) => {
			const idInstruksi = Object.entries(instruksi_id ?? {}).reduce<
				typeof instruksi_id
			>((ret, [idMesin, value]) => {
				const hasValue = value?.filter(Boolean);
				if (idMesin && hasValue?.length > 0) ret[idMesin] = value;
				return ret;
			}, {});
			return {...prev, instruksi_id: idInstruksi};
		});
	}, [mesinId?.join?.('')]);

	return (
		<>
			<Button onClick={() => showModal('add', {})}>Add</Button>
			<Table
				data={data}
				renderItem={({Cell, item}) => {
					return (
						<>
							<Cell></Cell>
						</>
					);
				}}
			/>
			<Modal size="6xl" ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild reset={reset} control={control} />
				</form>
			</Modal>
		</>
	);
}

function ModalChild({
	control,
	reset,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const [
		mesinIds = [],
		idCustomer,
		instruksiIds,
		idSppbIn,
		tempIdItem,
		kanbanItems = {},
		id_po,
	] = useWatch({
		control,
		name: [
			'mesin_id',
			'id_customer',
			'instruksi_id',
			'id_sppb_in',
			'temp_id_item',
			'items',
			'id_po',
		],
	});

	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {data: dataMesin} = trpc.basic.get.useQuery<any, TMesin[]>({
		target: CRUD_ENABLED.MESIN,
	});
	const {data: dataSppbIn} = trpc.sppb.get.useQuery(
		{
			type: 'sppb_in',
			where: {id_po},
		},
		{enabled: !!id_po},
	);
	const {data: dataInstruksi} = trpc.basic.get.useQuery<
		any,
		TInstruksiKanban[]
	>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});

	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});

	const selectedSppbIn = dataSppbIn?.find(e => e.id === idSppbIn);

	useEffect(() => {
		if (tempIdItem) {
			reset(({items, id_sppb_in, ...prevValue}) => {
				return {
					...prevValue,
					temp_id_item: '',
					id_sppb_in,
					items: {...items, [tempIdItem]: {id_sppb_in}} as typeof items,
				};
			});
		}
	}, [tempIdItem]);

	return (
		<>
			<Select
				firstOption="- Pilih Customer -"
				control={control}
				data={selectMapper(dataCustomer ?? [], 'id', 'name')}
				fieldName="id_customer"
			/>
			{idCustomer && (
				<Select
					control={control}
					fieldName="id_po"
					firstOption="- Pilih PO -"
					data={selectMapper(
						dataPo?.filter(e => e.id_customer === idCustomer) ?? [],
						'id',
						'nomor_po',
					)}
				/>
			)}

			{id_po && (
				<Select
					control={control}
					fieldName="id_sppb_in"
					firstOption="- Pilih Surat Jalan -"
					data={selectMapper(dataSppbIn ?? [], 'id', 'nomor_surat')}
				/>
			)}

			{idSppbIn && (
				<Select
					control={control}
					fieldName="temp_id_item"
					firstOption="- Tambah Item -"
					data={selectMapper(
						selectedSppbIn?.items.filter(
							e => !Object.keys(kanbanItems).includes(e.id),
						) ?? [],
						'id',
						'itemDetail.kode_item',
					)}
				/>
			)}

			<Table
				data={Object.entries(kanbanItems)}
				renderItem={({Cell, item: [id_item, item]}, i) => {
					if (item.id_sppb_in !== idSppbIn) return false;

					const rowItem = selectedSppbIn?.items.find(e => e.id === id_item);

					return (
						<>
							<Cell>{rowItem?.itemDetail?.kode_item}</Cell>
							<Cell>{rowItem?.itemDetail?.name}</Cell>
							{qtyList.map(num => {
								const keyQty = `qty${num}` as const;
								const keyUnit = `unit${num}` as const;

								if (!rowItem?.[keyQty]) return null;

								return (
									<Cell key={`${rowItem.id}${num}`}>
										<Input
											type="number"
											control={control}
											defaultValue={rowItem?.[keyQty]}
											fieldName={`items.${id_item}.${keyQty}`}
										/>
										<Input
											className="hidden"
											control={control}
											defaultValue={rowItem.id}
											fieldName={`items.${id_item}.id_item`}
										/>
										{rowItem?.itemDetail?.[keyUnit]}
									</Cell>
								);
							})}
							<Cell>
								<Button
									onClick={() =>
										reset(({items, ...prevValue}) => {
											delete items[id_item];
											return {...prevValue, items};
										})
									}>
									Delete
								</Button>
							</Cell>
						</>
					);
				}}
			/>

			<Button
				onClick={() => {
					reset(({mesin_id = [], ...rest}) => {
						mesin_id.push(undefined);
						return {...rest, mesin_id};
					});
				}}>
				Add Mesin
			</Button>

			<Table
				className={classNames('max-h-[400px] overflow-y-auto', {
					hidden: !mesinIds || mesinIds?.length <= 0,
				})}
				data={mesinIds}
				header={['Mesin', 'Instruksi']}
				renderItem={({Cell, item: idMesin}, i) => {
					const ids_instruksi = instruksiIds?.[idMesin] ?? [];
					return (
						<>
							<Cell className="w-1/2">
								<div className="flex flex-col gap-2">
									<Select
										control={control}
										fieldName={`mesin_id.${i}`}
										firstOption={`- Pilih Mesin ${i + 1} -`}
										data={selectMapper(
											dataMesin?.filter(
												mesin =>
													mesin.id === idMesin || !mesinIds.includes(mesin.id),
											) ?? [],
											'id',
											'nomor_mesin',
										)}
									/>
									{idMesin && (
										<Button
											onClick={() =>
												reset(({instruksi_id = {}, ...rest}) => {
													instruksi_id[idMesin] = instruksi_id[idMesin] ?? [];
													instruksi_id[idMesin]?.push(undefined);
													return {...rest, instruksi_id};
												})
											}>
											Add Instruksi
										</Button>
									)}
									<Button
										onClick={() => {
											reset(({mesin_id = [], ...rest}) => {
												return {...rest, mesin_id: mesin_id.remove(i)};
											});
										}}>{`Hapus Mesin ${i + 1}`}</Button>
								</div>
							</Cell>
							<Cell>
								<div className="flex flex-col gap-2">
									{ids_instruksi.map((id_instruksi, ii) => {
										return (
											<div key={id_instruksi} className="flex gap-2">
												<Select
													control={control}
													firstOption={`- Pilih Instruksi ${ii + 1} -`}
													fieldName={`instruksi_id.${idMesin}.${ii}`}
													data={selectMapper(dataInstruksi ?? [], 'id', 'name')}
												/>
												<Button
													icon="faTrash"
													onClick={() => {
														reset(({instruksi_id, ...rest}) => {
															return {
																...rest,
																instruksi_id: {
																	...instruksi_id,
																	[idMesin]:
																		instruksi_id[idMesin]?.remove(i) ?? [],
																},
															};
														});
													}}
												/>
											</div>
										);
									})}
								</div>
							</Cell>
						</>
					);
				}}
			/>

			<Button type="submit">Submit</Button>
		</>
	);
}
