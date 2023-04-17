import {useEffect} from 'react';

import {FormType} from 'pages/app/kanban';
import {Control, UseFormReset, useWatch} from 'react-hook-form';

import {
	Button,
	ImageFormWithPreview,
	Input,
	InputFile,
	Select,
	selectMapper,
} from '@components';
import {useKanban} from '@hooks';
import {modalTypeParser} from '@utils';

import {RenderItem} from './RenderItem';
import {RenderMesin} from './RenderMesin';

export function KanbanModalChild({
	control,
	reset,
}: {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
}) {
	const [idCustomer, idSppbIn, tempIdItem, kanbanItems = {}, id_po, modalType] =
		useWatch({
			control,
			name: [
				'id_customer',
				'id_sppb_in',
				'temp_id_item',
				'items',
				'id_po',
				'type',
			],
		});

	const {dataCustomer, dataPo, dataSppbIn} = useKanban();

	const {isPreview, isDelete} = modalTypeParser(modalType);

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

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-2">
				<Input
					className="flex-1"
					control={control}
					fieldName="keterangan"
					label="Keterangan"
				/>

				{isPreview ? (
					<ImageFormWithPreview
						className="w-20 max-h-20 overflow-hidden self-center"
						control={control}
						fieldName="image"
					/>
				) : (
					<InputFile
						label="Upload Image"
						accept="image/*"
						control={control}
						fieldName="image"
					/>
				)}
			</div>

			<div className="flex gap-2">
				<Select
					disabled={isPreview}
					className="flex-1"
					firstOption="- Pilih Customer -"
					control={control}
					data={selectMapper(dataCustomer ?? [], 'id', 'name')}
					fieldName="id_customer"
					label="Customer"
				/>
				{idCustomer && (
					<Select
						className="flex-1"
						control={control}
						fieldName="id_po"
						firstOption="- Pilih PO -"
						label="PO"
						data={selectMapper(
							dataPo?.filter(e => e.id_customer === idCustomer) ?? [],
							'id',
							'nomor_po',
						)}
					/>
				)}

				{id_po && (
					<Select
						className="flex-1"
						control={control}
						fieldName="id_sppb_in"
						label="Surat Jalan Masuk"
						firstOption="- Pilih Surat Jalan -"
						data={selectMapper(
							dataSppbIn?.filter(e => e.id_po === id_po) ?? [],
							'id',
							'nomor_surat',
						)}
					/>
				)}

				{idSppbIn && (
					<Select
						className="flex-1"
						control={control}
						fieldName="temp_id_item"
						label="Item"
						firstOption="- Tambah Item -"
						data={selectMapper(
							selectedSppbIn?.items?.filter(
								e => !Object.keys(kanbanItems).includes(e.id),
							) ?? [],
							'id',
							'itemDetail.name',
						)}
					/>
				)}
			</div>

			<div className="max-h-[250px] overflow-y-auto flex flex-col gap-2">
				<RenderItem control={control} reset={reset} />
			</div>

			<div className="max-h-[250px] overflow-y-auto flex flex-col gap-2">
				<RenderMesin control={control} reset={reset} />
			</div>

			{!isPreview && <Button type="submit">Submit</Button>}
		</div>
	);
}
