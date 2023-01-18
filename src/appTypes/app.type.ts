import {ROLE} from '@enum';

export type TUser = Record<'id' | 'username', string> & {role: ROLE};

export type Session = {
	expires: string;
	user?: TUser;
};

export type TMenu = {
	id: string;
	title: string;
	icon: string;
	path: string;
	id_parent?: string;
	subMenu?: TMenu[];
};
