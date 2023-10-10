import {Divider} from '@mui/material';
import {Control, UseFormReset, useWatch} from 'react-hook-form';

import {TMasterItem} from '@appTypes/app.type';
import {Button, Select, selectMapper} from '@components';
import {defaultInstruksi} from '@constants';
import {useAdditionalData} from '@hooks';
import {formData} from '@utils';

import {FormType} from './ModalChildMasterItem';

export type ProcessForm = Pick<FormType, 'instruksi'>;
export type RenderProcessProps = {
	idKat: string;
	control: Control<ProcessForm>;
	reset: UseFormReset<ProcessForm>;
};

export function RenderProcess({idKat, control, reset}: RenderProcessProps) {
	const [instruksiObj = {}] = useWatch({
		control,
		name: ['instruksi'],
	});

	const instruksis = instruksiObj[idKat] ?? [];

	const {
		dataInstruksi,
		parameterKategori,
		hardnessKategori,
		materialKategori,
		parameterData,
		materialData,
		hardnessData,
	} = useAdditionalData();

	const instruksiIds = instruksis?.map(e => e.id_instruksi) ?? [];

	const dataItemMapper = {
		material: materialData,
		parameter: parameterData,
		hardness: hardnessData,
	};

	const kategoriItemMapper = {
		parameter: parameterKategori,
		hardness: hardnessKategori,
		material: materialKategori,
	};

	function updateInstruksi(instruksi: TMasterItem['instruksi'][string]) {
		reset(prev => {
			const newData = formData(prev).set(`instruksi.${idKat}`, instruksi);
			return newData;
		});
	}

	function addInstruksi() {
		updateInstruksi(instruksis.concat(defaultInstruksi));
	}

	function removeInstruksi(index: number) {
		updateInstruksi(instruksis.remove(index));
	}

	return (
		<>
			<div className="grid-cols-1 grid gap-2">
				<Button onClick={addInstruksi}>Add Process</Button>
				{instruksis.map((instruksi, ii) => {
					type Key = Exclude<
						keyof typeof instruksi,
						| 'id_instruksi'
						| 'hardnessKategori'
						| 'parameterKategori'
						| 'materialKategori'
					>;

					const filteredDataInstruksi = dataInstruksi?.filter(
						e =>
							e.id === instruksi.id_instruksi || !instruksiIds?.includes(e.id),
					);

					const keys: Tuple<Key, 3> = ['material', 'hardness', 'parameter'];

					function addItem(key: Key) {
						const copyMesins = instruksis.slice();
						copyMesins[ii]?.[key].push('');
						updateInstruksi(copyMesins);
					}

					function removeItem(key: Key, index: number) {
						const keyKategori = `${key}Kategori` as const;
						const removedItem = instruksis[ii]?.[key].remove(index)!;
						const removedItemKategori =
							instruksis[ii]?.[keyKategori]?.remove(index)!;
						updateInstruksi(
							instruksis.replace(ii, {
								...instruksis[ii]!,
								[key]: removedItem,
								[keyKategori]: removedItemKategori,
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
										label="Proses"
										fieldName={`instruksi.${idKat}.${ii}.id_instruksi`}
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
										const isMaterial = key === 'material';

										return (
											<div
												className="flex-1 flex gap-2 flex-col"
												key={`${key}-${ii}`}>
												{instruksi[key].map((_, iii) => {
													const keyKategori = `${key}Kategori` as const;
													const selectedKategori =
														instruksi[keyKategori]?.[iii];
													let filteredDataItems = dataItemMapper[key]?.filter(
														e =>
															isMaterial
																? true
																: selectedKategori === e.id_kategori &&
																  (selectedItems[iii] === e.id ||
																		!selectedItems.includes(e.id)),
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
															{!isMaterial && (
																<Select
																	className="flex-1"
																	control={control}
																	label={`Kategori ${key.ucfirst()}`}
																	fieldName={`instruksi.${idKat}.${ii}.${key}Kategori.${iii}`}
																	data={selectMapper(
																		kategoriItemMapper[key] ?? [],
																		'id',
																		'name',
																	)}
																/>
															)}

															<Select
																key={filteredDataItems?.map(e => e.id).join('')}
																data={data}
																className="flex-1"
																control={control}
																label={key.ucfirst()}
																fieldName={`instruksi.${idKat}.${ii}.${key}.${iii}`}
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
		</>
	);
}
