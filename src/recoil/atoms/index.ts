import {atom} from 'recoil';

import {TMenu} from '@appTypes/app.zod';

export const atomSidebarOpen = atom({
	key: 'atomSidebar',
	default: true,
});

export const atomMenuIconKey = atom({
	key: 'atomMenuIconKey',
	default: '',
});

export const atomMappedMenu = atom<TMenu[]>({
	key: 'atomMappedMenu',
	default: [],
});

export const atomExcludedItem = atom<string[]>({
	key: 'atomExcludedItem',
	default: [],
});

export const atomIncludedItem = atom<string[]>({
	key: 'atomIncludedItem',
	default: [],
});

export const atomUidScan = atom<string[]>({
	key: 'atomUidScan',
	default: [uuid()],
});
