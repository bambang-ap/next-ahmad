import {Button, RootTable as Table, Text} from '@components';
import {useSppbOut} from '@hooks';
import {dateUtils, generatePDF, qtyMap} from '@utils';
import {trpc} from '@utils/trpc';

import {qtyList} from './ModalChild_po';

const {Td, Tr} = Table;

export function SPPBOutGenerateQR(props: {
	id: string;
	className?: string;
	transform?: boolean;
	withButton?: boolean;
}) {
	const tagId = `data-${props.id}`;

	const {
		id,
		transform = true,
		withButton = true,
		className = 'h-0 overflow-hidden -z-10 fixed',
		// className = '',
	} = props;

	const {dataFg} = useSppbOut();

	// const {data: qrImage} = trpc.qr.useQuery<any, string>(
	// 	{input: id},
	// 	{enabled: !!id},
	// );

	const {data: detail} = trpc.sppb.out.getDetail.useQuery(id, {enabled: !!id});

	return (
		<>
			{withButton && (
				<Button icon="faPrint" onClick={() => generatePDF(tagId)} />
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
							<Td className="flex-col gap-2">
								<Text>tanggal sj : {dateUtils.full(detail?.date)}</Text>
								<Text>no sj : {detail?.invoice_no}</Text>
								<Text>kendaraan : {detail?.data.kendaraan?.name}</Text>
								<Text>no pol : </Text>
							</Td>
							<Td className="flex-col gap-2">
								<Text>Customer : {detail?.data.customer?.name}</Text>
								<Text>Alamat : {detail?.data.customer?.alamat}</Text>
								<Text>No Telp : {detail?.data.customer?.no_telp}</Text>
								<Text>UP : {detail?.data.customer?.up}</Text>
							</Td>
						</Tr>
					</Table>
					<Table>
						<Tr>
							<Td>No</Td>
							<Td>Nama Barang</Td>
							{qtyList.map(num => (
								<Td key={num}>Qty</Td>
							))}
							<Td>Lot No Customer</Td>
							<Td>Lot No IMI</Td>
							<Td>No PO</Td>
							<Td>Proses</Td>
						</Tr>

						{detail?.po.map(po => {
							return (
								<>
									{po.sppb_in.map(e => {
										const selectedSppbIn = dataFg.find(
											eee => e.id_sppb_in === eee.kanban?.dataSppbIn?.id,
										);
										return (
											<>
												{Object.entries(e.items).map(
													([id_item, item], index) => {
														const {itemDetail} =
															selectedSppbIn?.kanban.dataSppbIn?.items?.find(
																eItem => eItem.id === id_item,
															) ?? {};
														return (
															<>
																<Tr>
																	<Td>{index + 1}</Td>
																	<Td>{itemDetail?.name}</Td>
																	{qtyMap(({num, qtyKey, unitKey}) => {
																		return (
																			<Td key={num}>
																				{item[qtyKey]} {itemDetail?.[unitKey]}
																			</Td>
																		);
																	})}
																	<Td>
																		{selectedSppbIn?.kanban.dataSppbIn?.lot_no}
																	</Td>
																	<Td>{selectedSppbIn?.lot_no_imi}</Td>
																	<Td>
																		{selectedSppbIn?.kanban.dataPo?.nomor_po}
																	</Td>
																	<Td className="flex-col gap-2">
																		{selectedSppbIn?.kanban.listMesin?.map(
																			m => {
																				return m.instruksi.map(ins => (
																					<Text key={ins.dataInstruksi?.id}>
																						{ins.dataInstruksi?.name}
																					</Text>
																				));
																			},
																		)}
																	</Td>
																</Tr>
															</>
														);
													},
												)}
											</>
										);
									})}
								</>
							);
						})}
					</Table>
				</div>
			</div>
		</>
	);
}
