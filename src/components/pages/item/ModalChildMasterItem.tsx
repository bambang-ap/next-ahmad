import {Control, UseFormReset, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TKategoriMesin,
	TMasterItem,
} from '@appTypes/app.type';
import {Button, Input, Select, selectMapper, Text} from '@components';
import {qtyIndex, selectUnitData} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {classNames, formData, modalTypeParser} from '@utils';
import {trpc} from '@utils/trpc';

import {RenderProcess} from './RenderProcess';

export type FormType = TMasterItem & {
	type: ModalTypePreview;
};

export function ModalChildMasterItem({
	control,
	reset,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const {data} = trpc.basic.get.useQuery<any, TKategoriMesin[]>({
		target: CRUD_ENABLED.MESIN_KATEGORI,
	});
	const {type: modalType, kategori_mesinn: kategoriMesin = []} = useWatch({
		control,
	});

	const {isDelete} = modalTypeParser(modalType);

	if (isDelete) {
		return (
			<div>
				<Text>Hapus ?</Text>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<>
			<Input control={control} fieldName="name" />
			<Input control={control} fieldName="kode_item" label="Kode Item" />
			<Input control={control} fieldName="harga" type="decimal" />
			<Input control={control} fieldName="keterangan" />
			<div className="flex gap-1">
				{qtyIndex.map(i => {
					const className = 'relative items-center flex border rounded-xl p-2';

					const defaultValue: TMasterItem['unit_notes'][number][0] =
						i === 0 ? 'Berat/pcs' : i === 1 ? 'Pcs/Lot' : 'Qty/Lot';

					return (
						<div key={i} className={classNames('gap-2', className)}>
							<Input
								disabled
								replaceValue={defaultValue}
								className="flex-1"
								control={control}
								fieldName={`unit_notes.${i}.0`}
								label={`Notes ${i + 1}`}
							/>
							<Input
								className="flex-1"
								control={control}
								fieldName={`unit_notes.${i}.1`}
								label={`Notes ${i + 1}`}
							/>
							{i === 2 && (
								<Select
									className="flex-1"
									control={control}
									data={selectUnitData}
									fieldName={`unit_notes.${i}.2`}
									label={`Unit ${i + 1}`}
								/>
							)}
						</div>
					);
				})}
			</div>

			<Button
				onClick={() =>
					reset(prev =>
						formData(prev).set('kategori_mesinn', [
							...(prev.kategori_mesinn ?? []),
							'',
						]),
					)
				}>
				Add Kategori Mesin
			</Button>

			{kategoriMesin?.map((kategori, i) => {
				return (
					<div key={kategori} className="flex gap-2">
						<div
							className={classNames('flex items-start gap-2', {
								'w-1/6': !!kategori,
								'flex-1': !kategori,
							})}>
							<div className="flex flex-col flex-1 gap-2">
								<Select
									key={kategori}
									control={control}
									className="flex-1"
									fieldName={`kategori_mesinn.${i}`}
									data={selectMapper(data ?? [], 'id', 'name').filter(
										e =>
											e.value === kategori || !kategoriMesin.includes(e.value),
									)}
								/>
								<RRR index={i} control={control} katMesin={kategori} />
							</div>
							<Button
								onClick={() =>
									reset(prev => {
										prev.instruksi = prev.instruksi ?? {
											[prev.kategori_mesinn[i]!]: [],
										};
										delete prev.instruksi[prev.kategori_mesinn[i]!];

										return {
											...prev,
											kategori_mesinn: prev.kategori_mesinn.remove(i),
											default_mesin:
												prev?.default_mesin?.remove(i) ?? prev?.default_mesin,
										};
									})
								}>
								Delete
							</Button>
						</div>
						{!!kategori && (
							<div className="flex-1">
								<RenderProcess
									idKat={kategori}
									// @ts-ignore
									control={control}
									// @ts-ignore
									reset={reset}
								/>
							</div>
						)}
					</div>
				);
			})}

			<Button type="submit">Submit</Button>
		</>
	);
}

// FIXME:
// @ts-ignore
function RRR({control, katMesin, index}) {
	const {data = []} = trpc.kanban.availableMesins.useQuery(katMesin, {
		enabled: !!katMesin,
	});

	if (!katMesin) return null;

	return (
		<Select
			label="Mesin"
			className="flex-1"
			control={control}
			fieldName={`default_mesin.${index}`}
			data={selectMapper(data, 'id', 'nomor_mesin')}
		/>
	);
}
