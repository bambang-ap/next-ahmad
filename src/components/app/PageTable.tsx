import {useRef} from 'react';

import {useRouter} from 'next/router';
import {Control, useController, useForm, useWatch} from 'react-hook-form';

import {ModalType} from '@appTypes/app.type';
import {Input, Modal, ModalRef, Select, Table} from '@components';
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
				<button onClick={() => showModal('add', {})}>Add</button>

				<Table
					data={data?.data ?? []}
					header={table.header}
					renderItem={({item}) => {
						const {id, ...rest} = item;

						return (
							<>
								{table.body?.map?.(key => (
									<td key={key}>{item[key]}</td>
								))}
								<td>
									<button onClick={() => showModal('edit', {id, ...rest})}>
										Edit
									</button>
									<button onClick={() => showModal('delete', {id})}>
										Delete
									</button>
								</td>
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
				<button type="submit">Ya</button>
			</div>
		);
	}

	return (
		<>
			{(modalType === 'add' || modalType === 'edit') &&
				modalField?.add?.map(item => (
					<RenderField key={item.col} control={control} item={item} />
				))}

			<button type="submit">Submit</button>
		</>
	);
};

type RenderFieldProps = {control: Control; item: ColUnion};

const RenderField = (props: RenderFieldProps) => {
	const {control, item} = props;
	const {col, label, editable} = item;

	if (item.type === 'select')
		return <RenderSelect control={control} item={item} />;

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

const RenderSelect = ({
	item,
	control,
}: {
	item: Extract<RenderFieldProps['item'], {type: 'select'}>;
	control: RenderFieldProps['control'];
}) => {
	const {col: name, renderItem, editable, onSelect, useFetch} = item;

	const {data} = useFetch();
	const {field} = useController({control, name});

	return (
		<Select
			editable={editable}
			fieldName={name}
			control={control}
			data={data?.data ?? []}
			renderItem={renderItem}
			onSelect={({item}) => field.onChange(onSelect(item))}
		/>
	);
};
