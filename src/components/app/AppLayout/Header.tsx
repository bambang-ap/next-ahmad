import {Navbar} from 'flowbite-react';
import {useRouter} from 'next/router';
import {useRecoilState} from 'recoil';

import {Button, Text} from '@components';
import {useAuth, useMenu} from '@hooks';
import {atomSidebarOpen} from '@recoil/atoms';

export default function Header() {
	useAuth();
	const {asPath} = useRouter();
	const {unMappedMenu} = useMenu();

	const title = unMappedMenu?.find(e => e.path === asPath);

	const [isSidebarOpen, setSidebarOpen] = useRecoilState(atomSidebarOpen);

	return (
		<Navbar fluid>
			<Button
				icon={isSidebarOpen ? 'faClose' : 'faBurger'}
				onClick={() => setSidebarOpen(e => !e)}
			/>
			<Text>{title?.title}</Text>
			{/* <DarkThemeToggle /> */}
		</Navbar>
	);
}
