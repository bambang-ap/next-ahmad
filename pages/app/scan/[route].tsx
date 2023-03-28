import {useRef} from 'react';

import {Scanner} from '@componentBlocks';
import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';

import {TDataScan} from '@appTypes/app.type';
import {TScanTarget, ZId} from '@appTypes/app.zod';
import {Button, Input, ModalRef} from '@components';
import {defaultErrorMutation} from '@constants';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

Scan.getLayout = getLayout;

type Route = {route: TScanTarget};

export default function Scan() {
	const {isReady} = useRouter();

	if (!isReady) return null;

	return <RenderScanPage />;
}

function RenderScanPage() {
	const qrcodeRef = useRef<ModalRef>(null);
	const router = useRouter();

	const {route} = router.query as Route;
	const {control, watch, handleSubmit, setValue} = useForm<ZId>();

	const id = watch('id');

	const {data, refetch} = trpc.scan.get.useQuery({id}, {enabled: false});
	const {mutate} = trpc.scan.update.useMutation({
		...defaultErrorMutation,
		onSuccess: () => refetch(),
	});

	const searchKanban = handleSubmit(() => {
		refetch();
	});

	function updateStatus() {
		mutate({id, target: route});
	}

	function onRead(result: string) {
		setValue('id', result);
	}

	return (
		<form onSubmit={searchKanban}>
			<Scanner ref={qrcodeRef} title={`Scan ${route}`} onRead={onRead} />
			<div className="flex gap-2 items-center">
				<Input className="flex-1" control={control} fieldName="id" />
				<Button onClick={() => qrcodeRef.current?.show()}>Scan</Button>
			</div>
			{data && (
				<RenderDataKanban {...data} updateStatus={updateStatus} route={route} />
			)}
		</form>
	);
}

function RenderDataKanban(
	kanban: TDataScan & Route & {updateStatus: () => void},
) {
	const {dataKanban, updateStatus, id, route, ...rest} = kanban;

	const currentKey = `status_${route}` as const;

	const currentStatus = rest[currentKey];

	return (
		<>
			{route}
			{id}
			{dataKanban?.[0]?.instruksi_kanban?.[0]?.name}
			{!currentStatus && <Button onClick={updateStatus}>Update</Button>}
		</>
	);
}
