import {useEffect, useRef} from 'react';

import {KanbanFormType as KanbanFormTypee} from 'pages/app/kanban';
import {useForm} from 'react-hook-form';
import {useSetRecoilState} from 'recoil';

import {Wrapper as Wrp, WrapperProps} from '@appComponent/Wrapper';
import {Route} from '@appTypes/app.type';
import {Button, Form, Modal, ModalRef} from '@components';
import {cuttingLineClassName, isProd} from '@constants';
import {PATHS} from '@enum';
import {getLayout} from '@hoc';
import {useRouter, useSession, useTableFilterComponent} from '@hooks';
import {NewKanbanModalChild} from '@pageComponent/kanban_ModalChild/index-new';
import {RenderData} from '@pageComponent/scan/list/RenderData';
import {RenderPdfData} from '@pageComponent/scan/list/RenderPdfData';
import {TxtBold} from '@pageComponent/sppbOut_GenerateQR';
import {atomHeaderTitle} from '@recoil/atoms';
import {classNames, getIds, modalTypeParser, scanRouterParser} from '@utils';
import {StorageScan} from '@utils/storage';
import {trpc} from '@utils/trpc';

ScanListData.getLayout = getLayout;
export const Text = TxtBold;
export type ScanListFormType = Omit<KanbanFormTypee, 'idKanbans'> & {
	idScans?: MyObject<boolean>;
};

export default function ScanListData() {
	const setTitle = useSetRecoilState(atomHeaderTitle);
	const {isReady, ...router} = useRouter();

	const {route} = router.query as Route;

	useEffect(() => {
		if (isReady && route) {
			const routeTitle = route.split('_').join(' ').ucwords();
			setTitle(`List ${routeTitle}`);
		}
	}, [isReady, route]);

	if (!isReady) return null;

	return <RenderScanList />;
}

function RenderScanList() {
	const {isAdmin} = useSession();
	const {push, ...router} = useRouter();
	const {route} = router.query as Route;

	const {control, watch, reset} = useForm<ScanListFormType>();

	const formData = watch();
	const modalRef = useRef<ModalRef>(null);

	const {type} = formData;
	const {isSelect, modalTitle, isPreview} = modalTypeParser(type);
	const {title, isQC, isProduksi, isFG} = scanRouterParser(route);

	const dateHeader = `Tanggal ${title}`;

	const {property, selectedIds} = getIds(formData, 'idScans');

	const {component, refetch, mutateOpts} = useTableFilterComponent({
		control,
		reset,

		property,
		header: [
			'No',
			!isProd && 'Id Kanban',
			'Tanggal',
			'Customer',
			'Nomor PO',
			'Nomor Surat',
			'Nomor Kanban',
			'Keterangan',
			dateHeader,
			!isSelect && 'Action',
		],
		genPdfOptions: isQC
			? {
					splitPagePer: 4,
					debug: true,
					orientation: 'l',
					width: 2250,
					tagId: `${route}-generated`,
					renderItem: data => (
						<div
							key={data.id_kanban}
							className={classNames('w-1/2 p-6', cuttingLineClassName)}>
							<RenderPdfData data={data!} route={route} />
						</div>
					),
					useQuery: () =>
						trpc.print.scan.useQuery(
							{ids: selectedIds, route},
							{enabled: isQC && selectedIds.length > 0},
						),
			  }
			: undefined,
		enabledExport: true,
		exportRenderItem: item => item,
		exportUseQuery: () =>
			trpc.export.scan.useQuery(
				{route, ids: selectedIds},
				{enabled: selectedIds.length > 0},
			),
		useQuery: form => trpc.scan.list.useQuery({...form, target: route}),
		renderItem(item, index) {
			return (
				<RenderData
					{...item}
					index={index}
					route={route}
					control={control}
					key={item.item.id_kanban}>
					<Button
						icon={isAdmin ? 'faEdit' : 'faMagnifyingGlass'}
						onClick={() => navigate(item.item.id_kanban)}
					/>
					{isAdmin && (
						<Button
							icon="faTrash"
							onClick={() => removeScan(item.item.id_kanban)}
						/>
					)}
				</RenderData>
			);
		},
	});

	const {mutateAsync: mutate} = trpc.scan.remove.useMutation(mutateOpts);

	function navigate(id: string) {
		const {app_scan_finish_good, app_scan_qc, app_scan_produksi} = PATHS;
		const pathname = isProduksi
			? app_scan_produksi
			: isQC
			? app_scan_qc
			: isFG
			? app_scan_finish_good
			: undefined;

		if (!pathname) {
			StorageScan.get(route)?.set(prev => {
				return prev.reduce(
					(ret, cur) => {
						if (ret.includes(cur)) return ret;
						return [...ret, cur];
					},
					[id],
				);
			});

			push({pathname});
		}
	}

	async function removeScan(id: string) {
		if (!confirm('Yakin ingin menghapus data ini?')) return;

		await mutate({id, status: route});
		refetch();
	}

	return (
		<>
			{component}
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form context={{disabled: isPreview, hideButton: isPreview}}>
					<NewKanbanModalChild reset={reset} control={control} />
				</Form>
			</Modal>
		</>
	);
}

export function Wrapper(props: WrapperProps) {
	return (
		<Wrp
			{...props}
			noColon
			smallPadding
			sizes={['w-1/4 font-semibold text-lg', 'flex-1 font-semibold text-lg']}
		/>
	);
}
