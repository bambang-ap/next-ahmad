import {useRef} from 'react';

import {useRouter} from 'next/router';
import {Control, useForm, useWatch} from 'react-hook-form';

import {ModalType} from '@appTypes/app.type';
import {Button, Input, Modal, ModalRef, Table, Text} from '@components';
import {allowedPages, ColUnion} from '@constants';

export const PageTable = () => {
	const {isReady, asPath} = useRouter();

	const hasPage = allowedPages[asPath as keyof typeof allowedPages];

	if (!isReady) return null;
	if (!hasPage) return null;

	return <RenderPage path={asPath} />;
};

const RenderPage = ({path}: {path: string}) => {
	const {text, table, queries} =
		allowedPages[path as keyof typeof allowedPages];

	const modalRef = useRef<ModalRef>(null);
	const manage = queries?.useManage?.();

	const {data, refetch} = queries?.useFetch?.() ?? {};
	const {control, handleSubmit, watch, reset} = useForm();

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
			case 'add':
				return manage.post.mutate(rest, {onSuccess});
			case 'edit':
				return manage.put.mutate({...rest, id}, {onSuccess});
			case 'delete':
				return manage.delete.mutate({id}, {onSuccess});
			default:
				return;
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
				<Button onClick={() => showModal('add', {})}>Add</Button>

				<Table
					data={data?.data ?? []}
					header={table.header}
					renderItem={({item, Cell}) => {
						const {id, ...rest} = item;

						return (
							<>
								{table.body?.map?.(key => (
									<Cell key={key}>
										<Text>{item[key]}</Text>
									</Cell>
								))}
								<Cell className="flex">
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

const ModalChild = ({control, path}: {control: Control; path: string}) => {
	const {modalField} = allowedPages[path as keyof typeof allowedPages];

	const modalType = useWatch({control, name: 'type'});

	if (modalType === 'delete') {
		return (
			<div>
				<label>Hapus ?</label>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<>
			{(modalType === 'add' || modalType === 'edit') &&
				modalField?.add?.map(item => (
					<RenderField key={item.col} control={control} item={item} />
				))}

			<Button type="submit">Submit</Button>
		</>
	);
};

type RenderFieldProps = {control: Control; item: ColUnion};

const RenderField = (props: RenderFieldProps) => {
	const {control, item} = props;
	const {col, label, editable} = item;

	return (
		<Input
			editable={editable}
			type={item.type}
			label={label}
			control={control}
			fieldName={col}
			placeholder={col}
		/>
	);
};
