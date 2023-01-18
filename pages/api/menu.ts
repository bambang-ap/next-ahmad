import {getSession, Response} from '@server/utils';
import {NextApiRequest, NextApiResponse} from 'next';

import {TMenu} from '@appTypes/app.type';

const menu: TMenu[] = [
	{id: '1', title: 'master menu', icon: '', path: ''},
	{id: '2', title: 'master user', icon: '', path: ''},
	{id: '22', id_parent: '2', title: 'role', icon: '', path: ''},
	{id: '23', id_parent: '2', title: 'user', icon: '', path: ''},
	{id: '3', title: 'menu master customer', icon: '', path: ''},
	{id: '4', title: 'menu master PO customer', icon: '', path: ''},
	{id: '5', title: 'menu master kanban', icon: '', path: ''},
	{id: '6', title: 'menu intruksi kanban', icon: '', path: ''},
	{
		id: '7',
		title: 'menu master stock produksi',
		icon: '',
		path: '',
	},
	{id: '8', title: 'menu DO', icon: '', path: ''},
	{id: '9', title: 'Global', icon: '', path: ''},
	{id: '91', id_parent: '9', title: 'Inventory', icon: '', path: ''},
	{id: '92', id_parent: '9', title: 'Suplier', icon: '', path: ''},
	{id: '93', id_parent: '9', title: 'PO suplier', icon: '', path: ''},
	{
		id: '10',
		id_parent: '93',
		title: 'Report master (Dashboard) (based on user role)',
		icon: '',
		path: '',
	},
];

export default async function apiMenu(
	req: NextApiRequest,
	res: NextApiResponse,
) {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('sdjhfklsdf');

	const allMenu = menu.nest('subMenu', 'id', 'id_parent');
	return Response(res).success(allMenu);
}
