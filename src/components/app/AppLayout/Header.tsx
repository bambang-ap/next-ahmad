import {Navbar} from 'flowbite-react';
import {useRecoilState} from 'recoil';

import {Button} from '@components';
import {useAuth} from '@hooks';
import {atomSidebarOpen} from '@recoil/atoms';

export default function Header() {
	useAuth();

	const [isSidebarOpen, setSidebarOpen] = useRecoilState(atomSidebarOpen);

	return (
		<Navbar fluid>
			<Button
				icon={isSidebarOpen ? 'faClose' : 'faBurger'}
				onClick={() => setSidebarOpen(e => !e)}
			/>

			{/* <DarkThemeToggle /> */}
		</Navbar>
	);
}
