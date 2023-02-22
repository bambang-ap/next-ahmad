import {MutableRefObject, useEffect, useRef} from 'react';

import {Control, useForm, UseFormSetValue} from 'react-hook-form';
import {atom, useRecoilValue, useSetRecoilState} from 'recoil';

import {AllIcon} from '@appComponent/AllIcon';
import {TMenu} from '@appTypes/app.type';
import {Button, IconForm, Input, Modal, ModalRef, Table} from '@components';
import {CRUD_ENABLED} from '@enum';
import {getLayout} from '@hoc';
import {trpc} from '@utils/trpc';

type FormMenu = Record<
	string,
	{title: string; icon: string; role: Record<string, boolean>}
>;

const atoms = atom({
	key: 'atoms',
	default: '',
});

export default function Menu() {
	const modalRef = useRef<ModalRef>(null);

	const {mutate} = trpc.menu.mutate.useMutation();
	const {data: unMappedMenu, refetch: reftechUnMapped} = trpc.menu.get.useQuery(
		{type: 'menu'},
	);
	const {data: mappedMenu, refetch} = trpc.menu.get.useQuery({
		type: 'menu',
		sorted: true,
	});
	const {data: dataRole} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.ROLE,
	});

	const {control, reset, watch, setValue, handleSubmit} = useForm<FormMenu>();

	const iconKey = useRecoilValue(atoms);

	const iconModalSelectedValue = watch(iconKey);

	const submit = handleSubmit(values => {
		const bodyParam = mappedMenu?.reduce<TMenu[]>((acc, menu) => {
			const {id, ...restMenu} = menu;
			const {icon, role, title} = values[id];

			const accepted_role = Object.entries(role)
				.reduce<string[]>((roles, [key, value]) => {
					if (value) roles.push(key);
					return roles;
				}, [])
				.join(',');

			acc.push({...restMenu, icon, title, id, accepted_role});

			return acc;
		}, []);

		mutate(bodyParam ?? [], {
			onSuccess: () => {
				refetch();
				reftechUnMapped();
			},
		});
	});

	useEffect(() => {
		const formDefaultValue = unMappedMenu?.reduce(
			(ret, {id, title, icon, accepted_role}) => {
				const roles = accepted_role.split(',');
				const role =
					dataRole?.reduce((acc, role) => {
						return {...acc, [role.name]: roles.includes(role.name)};
					}, {} as Record<string, boolean>) ?? {};

				return {
					...ret,
					[id]: {title, icon, role},
				};
			},
			{},
		);

		reset(formDefaultValue);
	}, [unMappedMenu, dataRole]);

	return (
		<>
			<Modal ref={modalRef} title="Select Icon">
				<AllIcon
					// @ts-ignore
					selected={iconModalSelectedValue}
					onSelect={icon => {
						// @ts-ignore
						setValue(iconKey, icon);
						modalRef.current?.hide();
					}}
				/>
			</Modal>

			<form onSubmit={submit}>
				<Button type="submit">Submit</Button>
				<RenderMenu
					modalRef={modalRef}
					control={control}
					data={mappedMenu}
					setValue={setValue}
				/>
			</form>
		</>
	);
}

const RenderMenu = (props: {
	noHeader?: boolean;
	className?: string;
	data?: TMenu[];
	control: Control<FormMenu>;
	setValue: UseFormSetValue<FormMenu>;
	modalRef: MutableRefObject<ModalRef | null>;
}) => {
	const {data: dataRole} = trpc.basic.get.useQuery({
		target: CRUD_ENABLED.ROLE,
	});
	const {data, noHeader, control, setValue, modalRef} = props;

	const setKey = useSetRecoilState(atoms);

	return (
		<Table
			data={data ?? []}
			header={noHeader ? undefined : ['Title', 'Icon', 'Role']}
			renderItemEach={({item: {subMenu}, Cell}) => {
				if (subMenu?.length <= 0) return false;

				return (
					<Cell colSpan={3}>
						<RenderMenu
							noHeader
							setValue={setValue}
							modalRef={modalRef}
							control={control}
							data={subMenu}
						/>
					</Cell>
				);
			}}
			renderItem={({item: {id}, Cell}) => {
				return (
					<>
						<Cell>
							<Input
								label="sjdfkjsdjf"
								control={control}
								fieldName={`${id}.title`}
							/>
						</Cell>
						<Cell>
							<IconForm
								control={control}
								fieldName={`${id}.icon`}
								onClick={() => {
									setKey(`${id}.icon`);
									modalRef.current?.show();
								}}
							/>
						</Cell>
						<Cell className="flex">
							{dataRole?.map(role => {
								return (
									<Input
										className="mr-2"
										type="checkbox"
										key={role.id}
										control={control}
										fieldName={`${id}.role.${role.name}`}
										label={role.name}
									/>
								);
							})}
						</Cell>
					</>
				);
			}}
		/>
	);
};

Menu.getLayout = getLayout;
