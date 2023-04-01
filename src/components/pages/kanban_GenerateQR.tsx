import {Fragment} from 'react';

import {RouterOutput} from '@appTypes/app.type';
import {Button, RootTable as Table} from '@components';
import {generatePDF} from '@utils';
import {trpc} from '@utils/trpc';

import {qtyList} from './ModalChild_po';

export function KanbanGenerateQR(
	kanban: RouterOutput['kanban']['get'][number] & {
		className?: string;
		transform?: boolean;
		withButton?: boolean;
	},
) {
	const tagId = `data-${kanban.id}`;

	const {
		className = 'p-4 w-[500px] -z-10 fixed',
		// className = 'p-4 w-[500px]',
		transform = true,
		withButton = true,
		id,
		keterangan: name,
		dataPo,
		dataMesin,
		items,
		dataSppbIn,
	} = kanban;

	const {data: qrImage} = trpc.qr.useQuery<any, string>(
		{input: id},
		{enabled: !!id},
	);

	return (
		<>
			{withButton && (
				<Button icon="faPrint" onClick={() => generatePDF(tagId)} />
			)}

			<div
				id={tagId}
				className={className}
				style={{
					...(transform && {
						transform: 'scale(0.7) translateY(-20%) translateX(-20%)',
					}),
				}}>
				<Table>
					<Table.Tr>
						<Table.Td className="w-full justify-center" colSpan={4}>
							{name}
						</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Td>Customer</Table.Td>
						<Table.Td>{dataPo?.customer?.name}</Table.Td>
						<Table.Td className="justify-center" colSpan={2} rowSpan={3}>
							<div className="w-[200px] h-[200px]">
								<img alt="" src={qrImage} />
							</div>
						</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Td>Nomor PO</Table.Td>
						<Table.Td>{dataPo?.nomor_po}</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Td>Nomor Surat</Table.Td>
						<Table.Td>{dataSppbIn?.nomor_surat}</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Td className="justify-center w-full" colSpan={2}>
							Data Mesin
						</Table.Td>
						<Table.Td className="justify-center w-full" colSpan={2}>
							Data Item
						</Table.Td>
					</Table.Tr>
					<Table.Tr>
						<Table.Td colSpan={2}>
							<Table>
								{dataMesin.map(mesin => {
									const {
										dataInstruksi,
										id: idMesin,
										name: nameMesin,
										nomor_mesin,
									} = mesin;
									return (
										<Fragment key={idMesin}>
											<Table.Tr>
												<Table.Td>{nameMesin}</Table.Td>
												<Table.Td>{nomor_mesin}</Table.Td>
											</Table.Tr>
											<Table.Tr>
												<Table.Td colSpan={2}>
													<Table>
														{dataInstruksi.map(instruksi => {
															const {name: nameInstruksi, id: idInstruksi} =
																instruksi;
															return (
																<Table.Tr key={idInstruksi}>
																	<Table.Td>{nameInstruksi}</Table.Td>
																</Table.Tr>
															);
														})}
													</Table>
												</Table.Td>
											</Table.Tr>
										</Fragment>
									);
								})}
							</Table>
						</Table.Td>
						<Table.Td colSpan={2}>
							<Table>
								<Table.THead>
									<Table.Tr>
										<Table.Td>Kode Item</Table.Td>
										<Table.Td>Nama Item</Table.Td>
										<Table.Td colSpan={qtyList.length}>Jumlah</Table.Td>
									</Table.Tr>
								</Table.THead>
								{Object.entries(items).map(([, item]) => {
									const {id: idItem, id_item} = item;
									const itemDetail = dataSppbIn?.items?.find(
										e => e.id === id_item,
									)?.itemDetail;

									return (
										<Table.Tr key={idItem}>
											<Table.Td>{itemDetail?.kode_item}</Table.Td>
											<Table.Td>{itemDetail?.name}</Table.Td>
											{qtyList.map(num => {
												const qtyKey = `qty${num}` as const;
												const unitKey = `unit${num}` as const;
												const qty = item[qtyKey];

												if (!qty) return null;

												return (
													<Table.Td key={num}>
														{qty} {itemDetail?.[unitKey]}
													</Table.Td>
												);
											})}
										</Table.Tr>
									);
								})}
							</Table>
						</Table.Td>
					</Table.Tr>
				</Table>
			</div>
		</>
	);
}
