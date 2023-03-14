import {useEffect, useRef} from 'react';

import {Control, useForm, UseFormReset, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TCustomer,
	TInstruksiKanban,
	TKanban,
	TMesin,
} from '@appTypes/app.zod';
import {
	Button,
	Modal,
	ModalRef,
	Select,
	selectMapper,
	Table,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

Kanban.getLayout = getLayout;

type FormType = TKanban & {
	type: ModalTypePreview;
	id_customer: string;
};

export default function Kanban() {
	const modalRef = useRef<ModalRef>(null);
	const {control, watch, reset, handleSubmit} = useForm<FormType>();

	const [mesinId] = watch(['mesin_id']);

	const submit = handleSubmit(values => {
		console.log(values);
	});

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
			<Button onClick={() => modalRef.current?.show()}>Add</Button>
			<Modal ref={modalRef}>
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
	const [mesinIds = [], idCustomer, instruksiIds] = useWatch({
		control,
		name: ['mesin_id', 'id_customer', 'instruksi_id'],
	});

	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {data: dataMesin} = trpc.basic.get.useQuery<any, TMesin[]>({
		target: CRUD_ENABLED.MESIN,
	});
	const {data: dataInstruksi} = trpc.basic.get.useQuery<
		any,
		TInstruksiKanban[]
	>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});

	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
	});

	return (
		<>
			<Select
				firstOption="- Pilih Customer -"
				control={control}
				data={selectMapper(dataCustomer ?? [], 'id', 'name')}
				fieldName="id_customer"
			/>
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
