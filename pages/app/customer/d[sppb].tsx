import {useRef} from 'react';

import {useRouter} from 'next/router';
import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalType, TCustomerSPPBIn, TCustomerSPPBOut} from '@appTypes/app.type';
import {
	Button,
	Input,
	Modal,
	ModalRef,
	Select,
	SelectPropsData,
	Table,
} from '@components';
import {TABLES} from '@enum';
import {getLayout} from '@hoc';
import {
	useFetchCustomerPO,
	useFetchCustomerSPPBIn,
	useFetchCustomerSPPBOut,
	useManageCustomerSPPBIn,
	useManageCustomerSPPBOut,
} from '@queries';

const a = {
	[TABLES.CUSTOMER_SPPB_IN]: {
		modal: {
			title: {
				add: '',
				edit: '',
				delete: '',
			},
		},
		table: {
			header: ['Name', 'Nomor PO', 'Action'],
			row: ['name', 'nomor_po'] as (keyof TCustomerSPPBIn)[],
		},
		queries: {manage: useManageCustomerSPPBIn, fetch: useFetchCustomerSPPBIn},
	},
	[TABLES.CUSTOMER_SPPB_OUT]: {
		modal: {
			title: {
				add: '',
				edit: '',
				delete: '',
			},
		},
		table: {
			header: ['Name', 'Nomor PO', 'Action'],
			row: ['name', 'nomor_po'] as (keyof TCustomerSPPBOut)[],
		},
		queries: {manage: useManageCustomerSPPBOut, fetch: useFetchCustomerSPPBOut},
	},
};
type Y = typeof a[keyof typeof a];

type FormType = TCustomerSPPBIn & {
	type: ModalType;
};

SPPB.getLayout = getLayout;

export default function SPPB() {
	const {isReady, query} = useRouter();

	const path = a[query.sppb as keyof typeof a];

	if (!isReady || !path) return null;

	return <RenderSPPB {...path} />;
}
function RenderSPPB(path: Y) {
	const modalRef = useRef<ModalRef>(null);
	const manageCustomerPO = path.queries.manage();

	const {data, refetch} = path.queries.fetch();
	const {control, handleSubmit, watch, reset} = useForm<FormType>();

	const modalType = watch('type');
	const modalTitle = path.modal.title[modalType];

	const submit = handleSubmit(({type, id, ...rest}) => {
		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'edit':
				return manageCustomerPO.put.mutate({...rest, id}, {onSuccess});
			case 'delete':
				return manageCustomerPO.delete.mutate({id}, {onSuccess});
		}

		return manageCustomerPO.post.mutate(rest, {onSuccess});
	});

	function showModal(type: ModalType, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild control={control} />
				</form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<Button onClick={() => showModal('add', {})}>Add</Button>

				<Table
					data={data?.data ?? []}
					header={path.table.header}
					renderItem={({item, Cell}) => {
						const {id, ...rest} = item;

						return (
							<>
								{path.table.row.map(row => (
									<Cell key={row}>{rest[row]}</Cell>
								))}
								<Cell className="flex gap-x-2">
									<Button onClick={() => showModal('edit', item)}>Edit</Button>
									<Button onClick={() => showModal('delete', {id})}>
										Delete
									</Button>
								</Cell>
							</>
						);
					}}
				/>
			</div>
		</>
	);
}

const ModalChild = ({control}: {control: Control<FormType>}) => {
	const [modalType] = useWatch({control, name: ['type']});

	const {data} = useFetchCustomerPO();

	const mappedData = (data?.data ?? []).map<SelectPropsData>(({nomor_po}) => ({
		value: nomor_po,
	}));

	if (modalType === 'delete') {
		return (
			<div>
				<label>Hapus ?</label>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<div className="gap-y-2 flex flex-col">
			<Input control={control} fieldName="name" />
			<Select
				firstOption="- Pilih PO -"
				control={control}
				data={mappedData}
				fieldName="nomor_po"
			/>

			<Button className="w-full" type="submit">
				Submit
			</Button>
		</div>
	);
};
