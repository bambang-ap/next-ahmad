import {useForm} from 'react-hook-form';

import {Input} from '@components';
import {getLayout} from '@hoc';
import {useSession} from '@hooks';
import {dateUtils} from '@utils';
import {trpc} from '@utils/trpc';

ScanProduksi.getLayout = getLayout;

export default function ScanProduksi() {
	const {data: session} = useSession();
	const {control, watch} = useForm<{id: string}>();

	const [id] = watch(['id']);

	const {data = []} = trpc.kanban.get.useQuery({
		type: 'kanban',
		where: {id: [id]},
	});

	const kanban = data?.[0];

	return (
		<>
			<Input control={control} fieldName="id" />

			{/* A */}
			<div>{session.user?.name}</div>
			<div>{dateUtils.full(kanban?.createdAt)}</div>
			<div>{kanban?.dataCreatedBy?.name}</div>
			<div>{kanban?.dataPo?.customer?.name}</div>
			<div>{kanban?.dataPo?.nomor_po}</div>
			<div>{kanban?.dataSppbIn?.nomor_surat}</div>
			<div>{kanban?.dataSppbIn?.tgl}</div>
			<div>{kanban?.dataSppbIn?.lot_no}</div>

			{/* B */}
			{Object.entries(kanban?.items ?? {}).map(([id_item, item]) => {
				return (
					<>
						<div>{item.qty1}</div>
					</>
				);
			})}
		</>
	);
}
