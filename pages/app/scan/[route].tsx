import {useEffect, useRef} from 'react';

import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';
import {useRecoilState} from 'recoil';

import {TDataScan} from '@appTypes/app.type';
import {TScanTarget, ZId} from '@appTypes/app.zod';
import {Scanner} from '@componentBlocks';
import {Button, Input, ModalRef} from '@components';
import {defaultErrorMutation} from '@constants';
import {getLayout} from '@hoc';
import {ScanDetailKanban} from '@pageComponent/scan_GenerateQR';
import {atomUidScan} from '@recoil/atoms';
import {trpc} from '@utils/trpc';

Scan.getLayout = getLayout;

type Route = {route: TScanTarget};

export default function Scan() {
	const [ids, setIds] = useRecoilState(atomUidScan);
	const {isReady, ...router} = useRouter();

	const {route} = router.query as Route;

	function addNew() {
		setIds(prev => [...prev, uuid()]);
	}

	useEffect(() => {
		return () => setIds([uuid()]);
	}, [route]);

	if (!isReady) return null;

	return (
		<div className="flex flex-col gap-2">
			<Button onClick={addNew}>Tambah</Button>
			{ids.map(uId => (
				<RenderScanPage key={uId} id={uId} />
			))}
		</div>
	);
}

function RenderScanPage({id: uId}: ZId) {
	const qrcodeRef = useRef<ModalRef>(null);
	const router = useRouter();
	const [ids, setIds] = useRecoilState(atomUidScan);

	const {route} = router.query as Route;
	const {control, watch, handleSubmit, setValue} = useForm<ZId>();

	const id = watch('id');

	const {data, refetch} = trpc.scan.get.useQuery(
		{id, target: route},
		{enabled: !!id, ...defaultErrorMutation},
	);
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

	function removeUid() {
		setIds(prev => {
			const index = ids.indexOf(uId);
			return prev.remove(index);
		});
	}

	return (
		<form onSubmit={searchKanban}>
			<Scanner ref={qrcodeRef} title={`Scan ${route}`} onRead={onRead} />
			<div className="flex gap-2 items-center">
				<Input className="flex-1" control={control} fieldName="id" />
				<Button onClick={() => qrcodeRef.current?.show()}>Scan Camera</Button>
				<Button onClick={removeUid}>Batalkan</Button>
				{id && <Button onClick={updateStatus}>Selesai</Button>}
			</div>
			{data && <RenderDataKanban {...data} route={route} />}
		</form>
	);
}

function RenderDataKanban(kanban: TDataScan & Route) {
	const {dataKanban, route, ...rest} = kanban;

	const [kanbans] = dataKanban ?? [];

	const currentKey = `status_${route}` as const;

	const currentStatus = rest[currentKey];

	if (!kanbans) return null;

	return (
		<>
			{currentStatus}
			<ScanDetailKanban route={route} status={currentStatus} {...kanbans} />
		</>
	);
}
