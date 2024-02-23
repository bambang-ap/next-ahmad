import {FormEventHandler, useRef} from 'react';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, useWatch} from 'react-hook-form';

import {FormProps, ModalTypeSelect, TRole} from '@appTypes/app.type';
import {tUserUpsert, TUserUpsert, zId} from '@appTypes/app.zod';
import {
	Button,
	Form,
	Input,
	Modal,
	ModalRef,
	Select,
	selectMapper,
} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {Fields, useTableFilterComponent} from '@hooks';
import {modalTypeParser, nullUseQuery, renderItemAsIs} from '@utils';
import {trpc} from '@utils/trpc';

MesinKategori.getLayout = getLayout;

type FormType = Fields<TUserUpsert>;

export default function User() {
	const modalRef = useRef<ModalRef>(null);
	const {data: roles} = trpc.basic.get.useQuery<any, TRole[]>({
		target: CRUD_ENABLED.ROLE,
	});
	const {control, reset, watch, clearErrors, handleSubmit} = useForm<FormType>({
		resolver: zodResolver(tUserUpsert.or(zId)),
	});

	const {component, refetch, mutateOpts} = useTableFilterComponent({
		reset,
		control,
		exportRenderItem: renderItemAsIs,
		exportUseQuery: nullUseQuery,
		useQuery: form => trpc.user.get.useQuery(form),
		topComponent: <Button onClick={() => showModal('add')}>Add</Button>,
		header: ['Nama', 'Email', 'Role', 'Action'],
		renderItem({Cell, item}) {
			const {id, email, name, role: roleId} = item;

			const role = roles?.find(e => e.id === roleId);

			return (
				<>
					<Cell>{name}</Cell>
					<Cell>{email}</Cell>
					<Cell>{role?.name}</Cell>

					<Cell className="gap-2">
						<Button
							icon="faMagnifyingGlass"
							onClick={() => showModal('preview', item)}
						/>
						<Button onClick={() => showModal('edit', item)} icon="faEdit" />
						{/* @ts-ignore */}
						<Button icon="faTrash" onClick={() => showModal('delete', {id})} />
					</Cell>
				</>
			);
		},
	});

	const dataForm = watch();

	const {mutate: upsertUser} = trpc.user.upsert.useMutation({
		...mutateOpts,
		onSuccess: refetch,
	});
	const {mutate: deleteUser} = trpc.user.delete.useMutation({
		...mutateOpts,
		onSuccess: refetch,
	});

	const {isPreview, modalTitle} = modalTypeParser(dataForm.type, 'User');

	const submit: FormEventHandler<HTMLFormElement> = e => {
		e.preventDefault();
		clearErrors();
		handleSubmit(values => {
			const {id} = values;
			const onSuccess = () => {
				modalRef.current?.hide();
				refetch();
			};

			switch (dataForm.type) {
				case 'edit':
					return upsertUser(values, {onSuccess});
				case 'delete':
					return deleteUser({id: id!}, {onSuccess});
				default:
					return upsertUser(values, {onSuccess});
			}
		})();
	};

	function showModal(type: ModalTypeSelect, initValue?: TUserUpsert) {
		// @ts-ignore
		reset(() => ({type, ...initValue}));
		modalRef.current?.show();
	}

	return (
		<>
			{component}
			<Modal title={modalTitle} size="xl" ref={modalRef}>
				<Form
					onSubmit={submit}
					className="flex flex-col gap-4"
					context={{disabled: isPreview, hideButton: isPreview}}>
					<ModalChild control={control} />
				</Form>
			</Modal>
		</>
	);
}

function ModalChild({control}: FormProps<FormType>) {
	const {data: roles = []} = trpc.basic.get.useQuery<any, TRole[]>({
		target: CRUD_ENABLED.ROLE,
	});
	const {type} = useWatch({control});
	const {isDelete, isEdit} = modalTypeParser(type);

	if (isDelete) return <Button type="submit">Ya</Button>;

	return (
		<>
			<Input control={control} fieldName="name" />
			<Input control={control} fieldName="email" />
			<Select
				fieldName="role"
				control={control}
				data={selectMapper(roles, 'id', 'name')}
			/>
			<Input
				control={control}
				fieldName="password"
				type="password"
				rightAcc={
					isEdit && (
						<div className="w-1/2">
							Note: Harap jangan mengisi password apabila tidak ingin
							mengubahnya
						</div>
					)
				}
			/>
			<Input
				type="password"
				control={control}
				label="Konfirmasi Password"
				fieldName="confirmPassword"
			/>

			<Button type="submit">Submit</Button>
		</>
	);
}
