import {RouterOutput} from '@appTypes/app.type';
import {Button, RootTable as Table, Text} from '@components';
import {dateUtils, generatePDF} from '@utils';
import {trpc} from '@utils/trpc';

import {qtyList} from './ModalChild_po';

const {Td, Tr} = Table;

export function KanbanGenerateQR(
	props: RouterOutput['kanban']['get'][number] & {
		className?: string;
		transform?: boolean;
		withButton?: boolean;
	},
) {
	const tagId = `data-${props.id}`;

	const {
		className = 'h-0 overflow-hidden -z-10 fixed',
		// className = '',
		docDetail,
		transform = true,
		withButton = true,
		id,
		items,
		dataSppbIn,
		...sppb
	} = props;

	const {data: qrImage} = trpc.qr.useQuery<any, string>(
		{input: id},
		{enabled: !!id},
	);

	return (
		<>
			{withButton && (
				<Button icon="faPrint" onClick={() => generatePDF(tagId, 'kanban')} />
			)}
			<div className={className}>
				<div
					id={tagId}
					className="flex flex-col gap-2 p-4 w-[600px]"
					style={{
						...(transform && {
							transform: 'scale(0.7) translateY(-20%) translateX(-20%)',
						}),
					}}>
					<Table>
						<Tr>
							<Td colSpan={2}>
								<img src={qrImage} alt="" />
							</Td>
							<Td colSpan={2} className="flex-col gap-2">
								<Text>Doc no : {docDetail?.doc_no}</Text>
								<Text>tgl kanban : {dateUtils.full(sppb.createdAt)}</Text>
								<Text>tgl sj masuk : {dateUtils.full(dataSppbIn?.tgl)}</Text>
							</Td>
						</Tr>
						<Tr>
							<Td colSpan={2} className="flex-col gap-2">
								<Text>no po : {sppb.dataPo?.nomor_po}</Text>
								<Text>no sj masuk : {dataSppbIn?.nomor_surat}</Text>
								<Text>no cust lot : {dataSppbIn?.lot_no}</Text>
							</Td>
							<Td colSpan={2} className="flex-col gap-2">
								<Text>created by : {sppb.dataCreatedBy?.name}</Text>
								<Text>customer : {sppb.dataPo?.customer?.name}</Text>
							</Td>
						</Tr>
					</Table>
					<Table>
						<Table.Tr>
							<Table.Td>kode_item</Table.Td>
							<Table.Td>name</Table.Td>
							<Table.Td colSpan={qtyList.length}>Jumlah</Table.Td>
						</Table.Tr>

						{Object.entries(items).map(([, item]) => {
							const {id: idItem, id_item} = item;
							const itemDetail = dataSppbIn?.items?.find(
								e => e.id === id_item,
							)?.itemDetail;

							return (
								<Table.Tr key={idItem}>
									<Table.Td>{itemDetail?.kode_item}</Table.Td>
									<Table.Td>{itemDetail?.name}</Table.Td>
									<Td colSpan={2} className="flex-col gap-2">
										{qtyList.map(num => {
											const qtyKey = `qty${num}` as const;
											const unitKey = `unit${num}` as const;
											const qty = item[qtyKey];

											if (!qty) return null;

											return (
												<Text key={num}>
													{qty} {itemDetail?.[unitKey]}
												</Text>
											);
										})}
									</Td>
								</Table.Tr>
							);
						})}
					</Table>
					<Table>
						<Tr>
							<Td>Nomor Mesin</Td>
							<Td>Name Mesin</Td>
							<Td>Process</Td>
						</Tr>

						{sppb.listMesin?.map(mesin => {
							return (
								<>
									<Tr>
										<Td>{mesin.dataMesin?.name}</Td>
										<Td>{mesin.dataMesin?.nomor_mesin}</Td>
										<Td>
											{mesin.instruksi.map(({dataInstruksi, ...instruksi}) => {
												const keys = [
													'material',
													'hardness',
													'parameter',
												] as const;
												return (
													<>
														<Table>
															<Tr>
																<Td>{dataInstruksi?.name}</Td>
															</Tr>
															<Tr>
																<Td>
																	{keys.map(key => {
																		return (
																			<Table key={key}>
																				<Tr>
																					<Td>{key}</Td>
																				</Tr>

																				{instruksi[key].map(itemn => {
																					const txt =
																						key === 'material'
																							? itemn?.name
																							: `${itemn?.name}`;
																					return (
																						<Tr key={itemn?.id}>
																							<Td>{txt}</Td>
																						</Tr>
																					);
																				})}
																			</Table>
																		);
																	})}
																</Td>
															</Tr>
														</Table>
													</>
												);
											})}
										</Td>
									</Tr>
								</>
							);
						})}
					</Table>
					<Table>
						<Tr>
							<Td colSpan={4}>Keterangan : {sppb.keterangan}</Td>
						</Tr>
					</Table>
				</div>
			</div>
		</>
	);
}
