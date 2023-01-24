import {MutableRefObject, useEffect, useRef} from 'react';

import {Control, useForm, UseFormSetValue} from 'react-hook-form';
import {atom, useRecoilValue, useSetRecoilState} from 'recoil';

import {AllIcon} from '@appComponent/AllIcon';
import {TMenu} from '@appTypes/app.type';
import {CheckBox, Input, Modal, ModalRef} from '@components';
import {getLayout} from '@hoc';
import {useFetchMenu, useFetchRole} from '@queries';

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

	const {data: dataMenu} = useFetchMenu();
	const {data: dataRole} = useFetchRole();
	const {control, reset, watch, setValue, handleSubmit} = useForm<FormMenu>();

	const key = useRecoilValue(atoms);

	const iconModalSelectedValue = watch(key);
	const submit = handleSubmit(e => console.log(e));

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
						setValue(key, icon);
						modalRef.current?.hide();
					}}
				/>
			</Modal>
			<div className="-ml-6 px-6">
				<button onClick={submit}>Submit</button>
				<div className="flex ml-6">
					<label className="w-1/3">Title</label>
					<label className="w-1/3">Icon</label>
					<label className="w-1/3">Role</label>
				</div>
				<RenderMenu
					modalRef={modalRef}
					className="[&>div:nth-child(odd)]:bg-blue-500"
					control={control}
					data={dataMenu?.data}
					setValue={setValue}
				/>
			</div>
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
		<div className={`ml-6 ${className}`}>
			{data?.map(({id, subMenu}) => {
				return (
					<>
						<div className="flex p-2">
							<Input
								className="w-1/3"
								control={control}
								fieldName={`${id}.title`}
							/>
							<Input
								className="w-1/3"
								control={control}
								fieldName={`${id}.icon`}
							/>
							<button
								onClick={() => {
									setKey(`${id}.icon`);
									modalRef.current?.show();
								}}>
								Change Icon
							</button>
							<div className="flex w-1/3 justify-end">
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
							</div>
						</div>
						{subMenu?.length > 0 && (
							<RenderMenu
								setValue={setValue}
								modalRef={modalRef}
								className="[&>div:nth-child(odd)]:bg-white"
								control={control}
								data={subMenu}
							/>
						)}
					</>
				);
			})}
		</div>
	);
};

Menu.getLayout = getLayout;
