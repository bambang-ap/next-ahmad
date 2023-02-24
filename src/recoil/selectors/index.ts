import {DefaultValue, selector} from 'recoil';

import {atomMappedMenu} from '@recoil/atoms';

export const selectorMappedMenu = selector<{
	fromIndex: number;
	toIndex: number;
	dataSourceIndex?: number;
}>({
	key: 'selectorMappedMenu',
	get: noop as any,
	set({get, set}, value) {
		if (value instanceof DefaultValue) return;

		const menu = get(atomMappedMenu);

		const {fromIndex, toIndex, dataSourceIndex} = value;

		const f = menu.slice().changeOrder(fromIndex, toIndex);
		console.log({menu, f});

		return;

		if (dataSourceIndex && dataSourceIndex >= 0) {
			// const targetMenu = menu[dataSourceIndex];
			// set(atomMappedMenu, menu.replace());
		} else set(atomMappedMenu, menu.changeOrder(fromIndex, toIndex));
	},
});
