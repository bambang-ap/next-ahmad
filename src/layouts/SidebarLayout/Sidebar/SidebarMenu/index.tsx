import React, {useContext} from 'react';

import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import {
	Collapse,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from '@mui/material';
import {useRouter} from 'next/router';

import {SidebarContext} from '@app/contexts/SidebarContext';
import {TMenu} from '@appTypes/app.zod';
import {Icon} from '@components';
import {trpc} from '@utils/trpc';

function SubMenu({title, path, icon, subMenu}: TMenu) {
	const {push} = useRouter();
	const [open, setOpen] = React.useState(false);

	function handleClick() {
		setOpen(opened => !opened);
		if (!!path) push(path);
	}

	return (
		<>
			<ListItemButton onClick={handleClick}>
				<ListItemIcon>
					<Icon name={icon} className="text-white" />
				</ListItemIcon>
				<ListItemText primary={title} />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItemButton>
			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div">
					<RenderMenuList data={subMenu} />
				</List>
			</Collapse>
		</>
	);
}

function Menu(menu: TMenu) {
	const {push} = useRouter();
	const {closeSidebar} = useContext(SidebarContext);

	const {id, path, title, icon, subMenu} = menu;

	const hasSubMenu = !!subMenu && subMenu.length > 0;

	function handleClick() {
		if (!!path) push(path);
		closeSidebar();
	}

	if (hasSubMenu) return <SubMenu {...menu} />;

	return (
		<ListItemButton onClick={handleClick} key={id}>
			<ListItemIcon>
				<Icon name={icon} className="text-white" />
			</ListItemIcon>
			<ListItemText primary={title} />
		</ListItemButton>
	);
}

function RenderMenuList({data}: {data?: TMenu[]}) {
	return (
		<>
			{data?.map(menu => {
				return <Menu key={menu.id} {...menu} />;
			})}
		</>
	);
}

function SidebarMenu() {
	const {data: listMenu} = trpc.menu.get.useQuery({type: 'menu', sorted: true});

	return (
		<List component="div">
			<RenderMenuList data={listMenu} />
		</List>
	);
}

export default SidebarMenu;
