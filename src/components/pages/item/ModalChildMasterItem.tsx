// @ts-nocheck
// FIXME:

import {Control, UseFormReset, useWatch} from 'react-hook-form';

import {
	ModalTypePreview,
	TKategoriMesin,
	TMasterItem,
} from '@appTypes/app.type';
import {Button, Input, Select, selectMapper, Text} from '@components';
import {CRUD_ENABLED} from '@enum';
import {classNames, formData} from '@utils';
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
	const [modalType, kategoriMesin = []] = useWatch({
		control,
		name: ['type', 'kategori_mesinn'],
	});

	if (modalType === 'delete') {
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
			<Input control={control} fieldName="kode_item" />
			<Input control={control} fieldName="keterangan" />

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
							<Select
								key={kategori}
								control={control}
								className="flex-1"
								fieldName={`kategori_mesinn.${i}`}
								data={selectMapper(data ?? [], 'id', 'name').filter(
									e => e.value === kategori || !kategoriMesin.includes(e.value),
								)}
							/>
							<Button
								onClick={() =>
									reset(prev => {
										prev.instruksi = prev.instruksi ?? {
											[prev.kategori_mesinn[i]!]: [],
										};
										delete prev.instruksi[prev.kategori_mesinn[i]!];
										return formData(prev).set(
											'kategori_mesinn',
											prev.kategori_mesinn.remove(i),
										);
									})
								}>
								Delete
							</Button>
						</div>
						{!!kategori && (
							<div className="flex-1">
								<RenderProcess
									idKat={kategori}
									control={control}
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
