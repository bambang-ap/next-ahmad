import {useEffect} from "react";

import {useForm} from "react-hook-form";
import {useRecoilState} from "recoil";

import {TMenu, TRole} from "@appTypes/app.type";
import {defaultErrorMutation, nonRequiredRefetch} from "@constants";
import {CRUD_ENABLED} from "@enum";
import {atomMappedMenu} from "@recoil/atoms";
import {trpc} from "@utils/trpc";

export type FormMenu = Record<
	string,
	{
		title: string;
		icon?: string;
		index: number;
		role: Record<string, boolean>;
	}
>;

export function useMenu() {
	const {mutate: mutateMenu} =
		trpc.menu.mutate.useMutation(defaultErrorMutation);
	const {data: unMappedMenu, refetch: reftechUnMapped} = trpc.menu.get.useQuery(
		{type: "menu"},
		nonRequiredRefetch,
	);
	const {data: mappedMenu, refetch: refetchMapped} = trpc.menu.get.useQuery(
		{
			type: "menu",
			sorted: true,
		},
		nonRequiredRefetch,
	);
	const {data: dataRole} = trpc.basic.get.useQuery<TRole, TRole[]>({
		target: CRUD_ENABLED.ROLE,
	});
	const [m, setMappedMenu] = useRecoilState(atomMappedMenu);

	const menuForm = useForm<FormMenu>();

	function reOrderMappedMenu(from: number, to: number) {
		setMappedMenu(prev => {
			const newOrderedMenu = reorderArrayIndex(prev, from, to);
			return newOrderedMenu;
		});
	}

	useEffect(() => {
		// @ts-ignore
		setMappedMenu(mappedMenu);
	}, [mappedMenu]);

	useEffect(() => {
		menuForm.reset(prev => {
			return Object.entries(prev).reduce((arr, [key, curr]) => {
				const index = m.findIndex(e => e.id === key);
				return {...arr, [key]: {...curr, index}};
			}, {});
		});
	}, [m]);

	return {
		dataRole,
		menuForm,
		mappedMenu: m,
		unMappedMenu: unMappedMenu as TMenu[] | undefined,
		reftechUnMapped: reftechUnMapped as NoopVoid,
		refetchMapped: refetchMapped as NoopVoid,
		mutateMenu,
		reOrderMappedMenu,
	};
}
