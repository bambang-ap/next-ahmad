import {Divider} from '@mui/material';
import {FormType} from 'pages/app/kanban';
import {Control, UseFormReset, useWatch} from 'react-hook-form';

import {TKanban} from '@appTypes/app.zod';
import {Button, Select, selectMapper} from '@components';
import {useKanban} from '@hooks';
import {modalTypeParser} from '@utils';

type RenderMesinProps = {
	control: Control<FormType>;
	reset: UseFormReset<FormType>;
};

export function RenderMesin({control, reset}: RenderMesinProps) {
	const [modalType, listMesin = []] = useWatch({
		control,
		name: ['type', 'list_mesin'],
	});

	const {isPreview} = modalTypeParser(modalType);
	const {dataMesin, dataInstruksi, parameterData, materialData, hardnessData} =
		useKanban();

	const dataItemMapper = {
		parameter: parameterData,
		material: materialData,
		hardness: hardnessData,
	};

	const selectedMesins = listMesin?.map(e => e.id_mesin);

	function updateMesin(list_mesin: TKanban['list_mesin']) {
		reset(prev => ({...prev, list_mesin}));
	}

	function removeMesin(index: number) {
		updateMesin(listMesin.remove(index));
	}

	function addMesin() {
		updateMesin([
			...listMesin,
			{
				id_mesin: '',
				instruksi: [
					{
						hardness: [''],
						id_instruksi: '',
						material: [''],
						parameter: [''],
					},
				],
			},
		]);
	}

	return (
		<>
			{!isPreview && <Button onClick={addMesin}>Add Mesin</Button>}

			<div className="grid-cols-2 grid gap-2">
				{listMesin?.map((mesin, i) => {
					const selectedInstruksis = mesin.instruksi.map(e => e.id_instruksi);
					const filteredDataMesin = dataMesin?.filter(
						e => e.id === mesin.id_mesin || !selectedMesins.includes(e.id),
					);

					function addInstruksi() {
						const copyMesins = listMesin.slice();
						copyMesins[i]?.instruksi.push({
							hardness: [''],
							id_instruksi: '',
							material: [''],
							parameter: [''],
						});
						updateMesin(copyMesins);
					}

					function removeInstruksi(index: number) {
						const copyMesins = listMesin.slice();
						const instruksi = copyMesins[i]?.instruksi.remove(index) ?? [];
						updateMesin(copyMesins.replace(i, {...mesin, instruksi}));
					}

					return (
						<div className="flex flex-col border rounded" key={mesin.id_mesin}>
							<div className="flex items-center gap-2 p-2">
								<Select
									className="flex-1"
									control={control}
									fieldName={`list_mesin.${i}.id_mesin`}
									data={selectMapper(filteredDataMesin ?? [], 'id', 'name')}
								/>
								<Button onClick={addInstruksi}>Add Process</Button>
								<Button onClick={() => removeMesin(i)}>Remove Mesin</Button>
							</div>
							{mesin.instruksi.map((instruksi, ii) => {
								type Key = Exclude<keyof typeof instruksi, 'id_instruksi'>;

								const filteredDataInstruksi = dataInstruksi?.filter(
									e =>
										e.id === instruksi.id_instruksi ||
										!selectedInstruksis.includes(e.id),
								);

								const keys: Tuple<Key, 3> = [
									'hardness',
									'material',
									'parameter',
								];

								function addItem(key: Key) {
									const copyMesins = listMesin.slice();
									copyMesins[i]?.instruksi[ii]?.[key].push('');
									updateMesin(copyMesins);
								}

								function removeItem(key: Key, index: number) {
									const copyMesins = listMesin.slice();
									const newInstruksi = copyMesins[i]?.instruksi!;
									const removedItem = newInstruksi[ii]?.[key].remove(index)!;
									updateMesin(
										copyMesins.replace(i, {
											...mesin,
											instruksi: newInstruksi.replace(ii, {
												...newInstruksi[ii]!,
												[key]: removedItem,
											}),
										}),
									);
								}

								return (
									<>
										<Divider />
										<div
											key={instruksi.id_instruksi}
											className="flex flex-col gap-2 p-2">
											<div className="flex items-center gap-2">
												<Select
													control={control}
													className="flex-1"
													fieldName={`list_mesin.${i}.instruksi.${ii}.id_instruksi`}
													data={selectMapper(
														filteredDataInstruksi ?? [],
														'id',
														'name',
													)}
												/>
												<Button onClick={() => removeInstruksi(ii)}>
													Remove Process
												</Button>
											</div>
											<div className="flex gap-2">
												{keys.map(key => (
													<Button
														className="flex-1"
														key={`${key}-${ii}`}
														onClick={() => addItem(key)}>
														{`Add ${key}`}
													</Button>
												))}
											</div>

											<div className="flex gap-2">
												{keys.map(key => {
													const selectedItems = instruksi[key];

													return (
														<div
															className="flex-1 flex gap-2 flex-col"
															key={`${key}-${ii}`}>
															{instruksi[key].map((_, iii) => {
																const filteredDataItems = dataItemMapper[
																	key
																]?.filter(
																	e =>
																		selectedItems[iii] === e.id ||
																		!selectedItems.includes(e.id),
																);

																const data = selectMapper(
																	filteredDataItems!,
																	'id',
																	'name',
																);

																return (
																	<div
																		key={`${ii}-${iii}`}
																		className="flex items-center gap-2">
																		<Select
																			data={data}
																			className="flex-1"
																			control={control}
																			fieldName={`list_mesin.${i}.instruksi.${ii}.${key}.${iii}`}
																		/>
																		<Button
																			onClick={() => removeItem(key, iii)}
																			icon="faTrash"
																		/>
																	</div>
																);
															})}
														</div>
													);
												})}
											</div>
										</div>
									</>
								);
							})}
						</div>
					);
				})}
			</div>
		</>
	);
}
