import {Fragment, MutableRefObject, useEffect, useRef} from 'react';

import {Control, useForm, UseFormSetValue} from 'react-hook-form';
import {atom, useRecoilValue, useSetRecoilState} from 'recoil';

import {AllIcon} from '@appComponent/AllIcon';
import {TMenu} from '@appTypes/app.type';
import {CheckBox, Input, Modal, ModalRef} from '@components';
import {getLayout} from '@hoc';
import {useFetchMenu, useFetchRole, useManageMenu} from '@queries';

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

	const {put} = useManageMenu();
	const {data: dataMenu, refetch} = useFetchMenu();
	const {data: dataRole} = useFetchRole();
	const {control, reset, watch, setValue, handleSubmit} = useForm<FormMenu>();

	const iconKey = useRecoilValue(atoms);

	const iconModalSelectedValue = watch(iconKey);
	const mappedMenu = dataMenu?.data.slice().nest('subMenu', 'id', 'parent_id');

	const submit = handleSubmit(values => {
		const bodyParam = dataMenu?.data.reduce<TMenu[]>((acc, menu) => {
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

		put.mutate(bodyParam ?? [], {onSuccess: () => refetch()});
	});

	useEffect(() => {
		const formDefaultValue = dataMenu?.data.reduce(
			(ret, {id, title, icon, accepted_role}) => {
				const roles = accepted_role.split(',');
				const role =
					dataRole?.data?.reduce((acc, role) => {
						return {...acc, [role.name]: roles.includes(role.name)};
					}, {} as Record<string, boolean>) ?? {};

				return {
					...ret,
					[id]: {title, icon, role},
				};
			},
			{} as FormMenu,
		);

		reset(formDefaultValue);
	}, [dataMenu?.data, dataRole?.data]);

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
				<button type="submit">Submit</button>
				<div className="flex ml-6">
					<label className="w-1/3">Title</label>
					<label className="w-1/3">Icon</label>
					<label className="w-1/3">Role</label>
				</div>

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
	className?: string;
	data?: TMenu[];
	control: Control<FormMenu>;
	setValue: UseFormSetValue<FormMenu>;
	modalRef: MutableRefObject<ModalRef | null>;
}) => {
	const {data: dataRole} = useFetchRole();
	const {data, control, setValue, className, modalRef} = props;

	const setKey = useSetRecoilState(atoms);

	return (
		<table className={`${className} w-full`}>
			{data?.map(({id, subMenu}) => {
				return (
					<>
						<tr className="w-full">
							<td>
								<Input control={control} fieldName={`${id}.title`} />
							</td>
							<td>
								<Input control={control} fieldName={`${id}.icon`} />
								<button
									onClick={() => {
										setKey(`${id}.icon`);
										modalRef.current?.show();
									}}>
									Change Icon
								</button>
							</td>
							<td>
								{dataRole?.data.map(role => {
									return (
										<CheckBox
											key={role.id}
											control={control}
											fieldName={`${id}.role.${role.name}`}
											label={role.name}
										/>
									);
								})}
							</td>
						</tr>
						{subMenu?.length > 0 && (
							<tr>
								<td className="pl-5" colSpan={3}>
									<RenderMenu
										setValue={setValue}
										modalRef={modalRef}
										control={control}
										data={subMenu}
									/>
								</td>
							</tr>
						)}
					</>
				);
			})}
		</table>
	);
};

Menu.getLayout = getLayout;
