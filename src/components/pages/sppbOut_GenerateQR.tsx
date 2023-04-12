import {Button, RootTable as Table, Text} from '@components';
import {dateUtils, generatePDF} from '@utils';
import {trpc} from '@utils/trpc';

const {Td, Tr, THead} = Table;

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
		className = 'flex flex-col gap-2 p-4 w-[500px] -z-10 fixed',
		// className = 'flex flex-col gap-2 p-4 w-[500px]',
	} = props;

	const {data: qrImage} = trpc.qr.useQuery<any, string>(
		{input: id},
		{enabled: !!id},
	);

	const {data: detail} = trpc.sppb.out.getDetail.useQuery(id, {enabled: !!id});

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
				{/* <Table>
					{detail?.po.map(po => {
						return (
							<>
								{po.sppb_in.map(e => {
									return (
										<>
											{Object.entries(e.items).map(([id_item, item]) => {
												return <>
												
												</>;
											})}
										</>
									);
								})}
							</>
						);
					})}
				</Table> */}
			</div>
		</>
	);
}
