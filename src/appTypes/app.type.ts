export type TUser = Record<
	'id' | 'email' | 'password' | 'name' | 'role',
	string
>;

export type Session = {
	expires: string;
	user?: TUser;
};

export type TMenu = {
	parent_id?: string;
	subMenu: TMenu[];
} & Record<'id' | 'title' | 'icon' | 'path' | 'accepted_role', string>;

export type TRole = {
	id: number;
	name: string;
};
