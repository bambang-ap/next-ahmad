import {MutableRefObject, useEffect, useRef} from 'react';

import {Control, UseFormSetValue} from 'react-hook-form';
import {useRecoilValue, useSetRecoilState} from 'recoil';

import {AllIcon} from '@appComponent/AllIcon';
import {TMenu, TRole} from '@appTypes/app.type';
import {Button, IconForm, Input, Modal, ModalRef, Table} from '@components';
import {getLayout} from '@hoc';
import {FormMenu, useMenu} from '@hooks';
import {atomMenuIconKey} from '@recoil/atoms';

Menu.getLayout = getLayout;

export default function Menu() {
	const modalRef = useRef<ModalRef>(null);

	const {
		dataRole,
		mappedMenu,
		unMappedMenu,
		menuForm,
		mutateMenu,
		refetchMapped,
		reftechUnMapped,
	} = useMenu();
	const {control, reset, watch, setValue, handleSubmit} = menuForm;
	const iconKey = useRecoilValue(atomMenuIconKey);
	// const changeOrder = useSetRecoilState(selectorMappedMenu);

	const iconModalSelectedValue = watch(iconKey);

	const submit = handleSubmit(values => {
		const bodyParam = unMappedMenu?.reduce<TMenu[]>((acc, menu) => {
			const {id, ...restMenu} = menu;
			const {icon, role, title, index} = values[id] as FormMenu[string];

			const accepted_role = Object.entries(role)
				.reduce<string[]>((roles, [key, value]) => {
					if (value) roles.push(key);
					return roles;
				}, [])
				.join(',');

			acc.push({...restMenu, index, icon, title, id, accepted_role});

			return acc;
		}, []);

		mutateMenu(bodyParam ?? [], {
			onSuccess: () => {
				refetchMapped();
				reftechUnMapped();
			},
		});
	});

	useEffect(() => {
		const formDefaultValue = unMappedMenu?.reduce<FormMenu>(
			(ret, {id, title, icon, accepted_role, index}) => {
				const roles = accepted_role.split(',');
				const role =
					dataRole?.reduce((acc, role) => {
						return {...acc, [role.name]: roles.includes(role.name)};
					}, {} as Record<string, boolean>) ?? {};

				return {
					...ret,
					[id]: {title, icon, role, index},
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
				{/* <ReactDragListView
					onDragEnd={(fromIndex, toIndex) => {
						changeOrder({fromIndex, toIndex, reset});
					}}
					nodeSelector="tr"
					handleSelector="tr"> */}
				<RenderMenu
					dataRole={dataRole}
					modalRef={modalRef}
					control={control}
					data={mappedMenu}
					setValue={setValue}
				/>
				{/* </ReactDragListView> */}
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
	dataRole?: TRole[];
}) => {
	const {data, dataRole, noHeader, control, setValue, modalRef} = props;

	const setKey = useSetRecoilState(atomMenuIconKey);

	return (
		<Table
			data={data ?? []}
			header={noHeader ? undefined : ['Title', 'Icon', 'Role']}
			renderItemEach={({item: {subMenu}, Cell}) => {
				if (!subMenu || (subMenu && subMenu?.length <= 0)) return false;

				return (
					<Cell colSpan={3}>
						<RenderMenu
							noHeader
							dataRole={dataRole}
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
						<Cell className="flex">
							<Input control={control} fieldName={`${id}.title`} />
							<Input
								control={control}
								type="number"
								fieldName={`${id}.index`}
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
