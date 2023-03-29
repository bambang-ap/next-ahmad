import {DarkThemeToggle, Navbar} from 'flowbite-react';
import {useRouter} from 'next/router';
import {useRecoilState} from 'recoil';

import {Button, Text} from '@components';
import {useAuth, useMenu} from '@hooks';
import {atomSidebarOpen} from '@recoil/atoms';

export default function Header() {
	useAuth();

	const {asPath} = useRouter();
	const {unMappedMenu} = useMenu();

	const [isSidebarOpen, setSidebarOpen] = useRecoilState(atomSidebarOpen);

	const title = unMappedMenu?.find(e => e.path === asPath);

	return (
		<Navbar fluid>
			<Button
				icon={isSidebarOpen ? 'faClose' : 'faBurger'}
				onClick={() => setSidebarOpen(e => !e)}
			/>
			<div className="flex flex-1 items-center">
				<Text className="flex-1 text-center">{title?.title}</Text>
				<DarkThemeToggle />
			</div>
		</Navbar>
	);
}
