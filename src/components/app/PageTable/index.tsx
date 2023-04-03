import {Suspense, useRef} from 'react';

import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';

import {ModalType, TUser} from '@appTypes/app.type';
import {Button, Modal, ModalRef, TableFilter, Text} from '@components';
import {allowedPages, defaultErrorMutation} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {useTableFilter} from '@hooks';
import {trpc} from '@utils/trpc';

import {ModalChild} from './ModalChild';
import {RenderImportCustomer} from './RenderImportCustomer';
import {QRUserLogin, RenderTableCell, UserTokenCopy} from './component';

export const PageTable = () => {
	const {isReady, asPath} = useRouter();

	const hasPage = allowedPages[asPath as keyof typeof allowedPages];

	if (!isReady || !hasPage) return null;

	return <RenderPage path={asPath} />;
};

const RenderPage = ({path}: {path: string}) => {
	const {
		text,
		table,
		enumName: target,
		searchKey,
	} = allowedPages[path as keyof typeof allowedPages] ?? {};

	const modalRef = useRef<ModalRef>(null);
	const {mutate} = trpc.basic.mutate.useMutation({
		...defaultErrorMutation,
		onSuccess() {
			refetch();
		},
	});

	const {formValue, hookForm} = useTableFilter();
	const {control, handleSubmit, watch, reset} = useForm();

	const {data: dataTable, refetch} = trpc.basic.getPage.useQuery({
		target,
		searchKey,
		...formValue,
	});

	const isOnCustomer = target === CRUD_ENABLED.CUSTOMER;
	const isOnUser = target === CRUD_ENABLED.USER;

	const modalType = watch('type');
	const modalTitle =
		modalType === 'add'
			? text?.modal?.add
			: modalType === 'edit'
			? text?.modal?.edit
			: text?.modal?.delete;

	const submit = handleSubmit(({type, id, ...rest}) => {
		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'edit':
				return mutate({target, type, body: {...rest, id}}, {onSuccess});
			case 'delete':
				return mutate({target, type, body: {id}}, {onSuccess});
			default:
				return mutate({target, type, body: rest}, {onSuccess});
		}
	});

	function showModal(type: ModalType, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild path={path} control={control} />
				</form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<TableFilter
					form={hookForm}
					header={table?.header}
					data={dataTable?.rows ?? []}
					pageCount={dataTable?.totalPage}
					topComponent={
						<>
							<Button onClick={() => showModal('add', {})}>Add</Button>
							{/* NOTE: Import CSV with popup generated - untuk sementara page customer saja */}
							{/* NOTE: Optimize Menu change accepter_role to array of string json, use new Set to make sure its unique */}
							{isOnCustomer && (
								<Suspense>
									<RenderImportCustomer refetch={refetch} />
								</Suspense>
							)}
						</>
					}
					renderItem={({item, Cell}) => {
						// @ts-ignore
						const {id, ...rest} = item;

						return (
							<>
								{table?.body?.map?.(key => {
									if (Array.isArray(key))
										return (
											<Cell>
												<RenderTableCell item={item} keys={key} />
											</Cell>
										);

									return (
										<Cell key={key as string}>
											<Text>{item[key]}</Text>
										</Cell>
									);
								})}
								<Cell className="flex gap-x-2">
									{isOnUser && (
										<>
											<UserTokenCopy {...(item as TUser)} />
											<QRUserLogin {...(item as TUser)} />
										</>
									)}
									<Button onClick={() => showModal('edit', {id, ...rest})}>
										Edit
									</Button>
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
};
