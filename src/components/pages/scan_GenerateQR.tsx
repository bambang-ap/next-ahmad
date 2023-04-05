import {RouterOutput, TScanTarget} from '@appTypes/app.type';
import {RootTable as Table} from '@components';

import {qtyList} from './ModalChild_po';

function jumlahTitleMapper(target: TScanTarget) {
	switch (target) {
		case 'produksi':
			return 'Jumlah planning';
		case 'qc':
			return 'Jumlah produksi';
		case 'finish_good':
			return 'Jumlah qc';
		default:
			return '';
	}
}

export function ScanDetailKanban(
	kanban: RouterOutput['kanban']['get'][number] & {
		route: TScanTarget;
		status?: boolean;
	},
) {
	const {keterangan, dataPo, items, dataSppbIn, route, status, listMesin} =
		kanban;

	return (
		<Table>
			<Table.Tr>
				<Table.Td className="w-full justify-center" colSpan={3}>
					{keterangan}
				</Table.Td>
			</Table.Tr>
			<Table.Tr>
				<Table.Td colSpan={3}>
					<Table>
						<Table.Tr>
							<Table.Td>
								<Table>
									<Table.Tr>
										<Table.Td>Nama Mesin</Table.Td>
										<Table.Td>nomor mesin</Table.Td>
										<Table.Td>Instruksi</Table.Td>
									</Table.Tr>

									{listMesin?.map(mesin => {
										return (
											<Table.Tr key={mesin.dataMesin?.id}>
												<Table.Td>{mesin.dataMesin?.name}</Table.Td>
												<Table.Td>{mesin.dataMesin?.nomor_mesin}</Table.Td>
												<Table.Tr>
													{mesin.instruksi?.map(instruksi => {
														return (
															<Table.Td key={instruksi.dataInstruksi?.id}>
																{instruksi.dataInstruksi?.name}
															</Table.Td>
														);
													})}
												</Table.Tr>
											</Table.Tr>
										);
									})}
								</Table>
							</Table.Td>
						</Table.Tr>
						<Table.Tr>
							<Table.Td>
								<Table>
									<Table.THead>
										<Table.Tr>
											<Table.Td>Nama Item</Table.Td>
											<Table.Td colSpan={qtyList.length}>
												{jumlahTitleMapper(route)}
											</Table.Td>
											<Table.Td colSpan={qtyList.length}>{route}</Table.Td>
										</Table.Tr>
									</Table.THead>
									{Object.entries(items).map(([, item]) => {
										const {id: idItem, id_item} = item;
										const itemDetail = dataSppbIn?.items?.find(
											e => e.id === id_item,
										)?.itemDetail;

										return (
											<Table.Tr key={idItem}>
												<Table.Td className="text-lg">
													{itemDetail?.name}
												</Table.Td>
												{qtyList.map(num => {
													const qtyKey = `qty${num}` as const;
													const unitKey = `unit${num}` as const;
													const qty = item[qtyKey];

													if (!qty) return null;

													return (
														<Table.Td key={num} className="text-lg">
															{qty} {itemDetail?.[unitKey]}
														</Table.Td>
													);
												})}
												{qtyList.map(num => {
													const qtyKey = `qty${num}` as const;
													const unitKey = `unit${num}` as const;
													const qty = item[qtyKey];

													if (!qty) return null;

													return (
														<Table.Td key={num} className="text-lg">
															{status ? qty : 0} {itemDetail?.[unitKey]}
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
				</Table.Td>
			</Table.Tr>
			<Table.Tr>
				<Table.Td>Customer</Table.Td>
				<Table.Td>Nomor PO</Table.Td>
				<Table.Td>Nomor Surat</Table.Td>
			</Table.Tr>
			<Table.Tr>
				<Table.Td>{dataPo?.customer?.name}</Table.Td>
				<Table.Td>{dataPo?.nomor_po}</Table.Td>
				<Table.Td>{dataSppbIn?.nomor_surat}</Table.Td>
			</Table.Tr>
		</Table>
	);
}
