export type TUser = Record<
	'id' | 'email' | 'password' | 'name' | 'role' | 'createdAt' | 'updatedAt',
	string
>;

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
