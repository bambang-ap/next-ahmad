import {Fragment, MutableRefObject, useEffect, useRef} from 'react';

import {Control, UseFormSetValue} from 'react-hook-form';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';

import {AllIcon} from '@appComponent/AllIcon';
import {TMenu, TRole} from '@appTypes/app.type';
import {Button, IconForm, Input, Modal, ModalRef, Table} from '@components';
import {getLayout} from '@hoc';
import {FormMenu, useLoader, useMenu} from '@hooks';
import {atomMenuChangeOrder, atomMenuIconKey} from '@recoil/atoms';
import {isAdminRole} from '@utils';

// TODO: Change menu renderer data to useMenu().all method

Menu.getLayout = getLayout;

export default function Menu() {
	const loader = useLoader();
	const modalRef = useRef<ModalRef>(null);

	const {
		dataRole,
		mappedMenu,
		unMappedMenu,
		menuForm,
		mutateMenu,
		refetchMapped,
		refetchUnMapped: reftechUnMapped,
	} = useMenu();

	const [changeOrderEnabled, changeOrder] = useRecoilState(atomMenuChangeOrder);
	const {control, reset, watch, setValue, handleSubmit} = menuForm;
	const iconKey = useRecoilValue(atomMenuIconKey);

	const iconModalSelectedValue = watch(iconKey);

	function submit(alertShown = true) {
		handleSubmit(values => {
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

			loader.show?.();
			mutateMenu(bodyParam ?? [], {
				onSuccess: () => {
					refetchMapped();
					reftechUnMapped();
					changeOrder(false);
					if (alertShown) alert('Success');
				},
				onSettled() {
					loader.hide?.();
				},
			});
		})();
	}

	function toggleChangeOrder() {
		changeOrder(prev => !prev);
		if (changeOrderEnabled) submit(false);
	}

	useEffect(() => {
		const formDefaultValue = unMappedMenu?.reduce<FormMenu>(
			(ret, {id, title, icon, accepted_role, index}) => {
				const roles = accepted_role.split(',');
				const role =
					dataRole?.reduce((acc, roleObject) => {
						return {...acc, [roleObject.id]: roles.includes(roleObject.id)};
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
			{loader.component}
			<Modal ref={modalRef} title="Select Icon">
				<div className="max-h-[300px] overflow-y-auto">
					<AllIcon
						// @ts-ignore
						selected={iconModalSelectedValue}
						onSelect={icon => {
							// @ts-ignore
							setValue(iconKey, icon);
							modalRef.current?.hide();
						}}
					/>
				</div>
			</Modal>

			<form
				className="flex flex-col gap-2"
				onSubmit={e => {
					e.preventDefault();
					submit();
				}}>
				<div className="flex gap-2">
					<Button onClick={toggleChangeOrder}>
						{changeOrderEnabled ? 'Finish Change Order' : 'Change Order'}
					</Button>
					<Button type="submit">Submit</Button>
				</div>
				<RenderMenu
					dataRole={dataRole}
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
	dataRole?: TRole[];
}) => {
	const {data, dataRole, noHeader, control, setValue, modalRef} = props;

	const {reOrderMappedMenu} = useMenu();

	const changeOrderEnabled = useRecoilValue(atomMenuChangeOrder);
	const setKey = useSetRecoilState(atomMenuIconKey);

	return (
		<Table
			data={data ?? []}
			header={noHeader ? undefined : ['Icon', 'Title', 'Role']}
			renderItemEach={({item: {subMenu}, Cell}) => {
				if (changeOrderEnabled || !subMenu || (subMenu && subMenu?.length <= 0))
					return false;

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
			renderItem={({item: {id, parent_id}, Cell}, index) => {
				function reorder(to: number) {
					reOrderMappedMenu(index, index + to);
				}
				return (
					<Fragment key={id}>
						<Cell className="justify-center items-center gap-2">
							{changeOrderEnabled && !parent_id && (
								<>
									<Button onClick={() => reorder(-1)} icon="faArrowUp" />
									<Button onClick={() => reorder(1)} icon="faArrowDown" />
									<Input
										className="flex-1 hidden"
										control={control}
										fieldName={`${id}.index`}
										noLabel
									/>
								</>
							)}
							<IconForm
								control={control}
								fieldName={`${id}.icon`}
								onClick={() => {
									setKey(`${id}.icon`);
									modalRef.current?.show();
								}}
							/>
						</Cell>
						<Cell width={500} className="flex gap-2">
							<Input
								className="flex-1"
								control={control}
								fieldName={`${id}.title`}
								noLabel
							/>
						</Cell>
						<Cell className="flex flex-1 flex-wrap">
							{dataRole?.map(role => {
								if (isAdminRole(role.name)) return null;

								return (
									<div className="w-1/4 p-1" key={role.id}>
										<Input
											type="checkbox"
											control={control}
											fieldName={`${id}.role.${role.id}`}
											label={role.name.ucwords()}
										/>
									</div>
								);
							})}
						</Cell>
					</Fragment>
				);
			}}
		/>
	);
};
