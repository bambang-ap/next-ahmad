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
import {useRecoilValue} from 'recoil';

import {SidebarContext} from '@app/contexts/SidebarContext';
import {MenuSubT} from '@appTypes/app.type';
import {Icon} from '@components';
import {PATHS} from '@enum';
import {useMenu, useRouter} from '@hooks';
import {atomIsMobile} from '@recoil/atoms';

function SubMenu({title, path, icon, OrmMenus: subMenu}: MenuSubT) {
	const {push} = useRouter();
	const [open, setOpen] = React.useState(false);

	function handleClick() {
		setOpen(opened => !opened);
		if (!!path) push(path as PATHS);
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

function Menu(menu: MenuSubT) {
	const isMobile = useRecoilValue(atomIsMobile);

	const {push} = useRouter();
	const {closeSidebar} = useContext(SidebarContext);

	const {id, path, title, icon, OrmMenus: subMenu} = menu;

	const hasSubMenu = !!subMenu && subMenu.length > 0;

	function handleClick() {
		if (!!path) push(path as PATHS);
		if (isMobile) closeSidebar();
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

function RenderMenuList({data}: {data?: MenuSubT[]}) {
	return (
		<>
			{data?.map(menu => {
				return <Menu key={menu.id} {...menu} />;
			})}
		</>
	);
}

function SidebarMenu() {
	// const {data: listMenu} = trpc.menu.get.useQuery({type: 'menu', sorted: true});

	const {allSub: listMenu} = useMenu();

	return (
		<List component="div">
			<RenderMenuList data={listMenu} />
		</List>
	);
}

export default SidebarMenu;
