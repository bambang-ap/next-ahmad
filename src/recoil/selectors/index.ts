import {UseFormReset} from 'react-hook-form';
import {DefaultValue, selector} from 'recoil';

import {FormMenu} from '@hooks';
import {atomMappedMenu} from '@recoil/atoms';

export const selectorMappedMenu = selector<{
	fromIndex: number;
	toIndex: number;
	dataSourceIndex?: number;
	reset: UseFormReset<FormMenu>;
}>({
	key: 'selectorMappedMenu',
	get: noop as any,
	set({get, set}, value) {
		if (value instanceof DefaultValue) return;

		const menu = get(atomMappedMenu);

		const {fromIndex, toIndex, reset, dataSourceIndex} = value;

		if (dataSourceIndex && dataSourceIndex >= 0) {
			// const targetMenu = menu[dataSourceIndex];
			// set(atomMappedMenu, menu.replace());
		} else {
			const orderedMenu = menu.changeOrder(fromIndex, toIndex);
			set(atomMappedMenu, orderedMenu);
			reset(formMenu => {
				return orderedMenu.reduce((ret, item, index) => {
					const {id} = item;
					return {...ret, [id]: {...formMenu[id], index}};
				}, {});
			});
		}
	},
});
