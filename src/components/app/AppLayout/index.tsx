import {PropsWithChildren, useEffect, useState} from 'react';

import {useRecoilValue} from 'recoil';

import {Icon, Text} from '@components';
import {atomSidebarOpen} from '@recoil/atoms';

import Header from './Header';
import {SideBar} from './SideBar';

const id = 'app-container';

export default function AppLayout({children}: PropsWithChildren) {
	const isSidebarOpen = useRecoilValue(atomSidebarOpen);
	const [clientHeight, setClientHeight] = useState(0);

	useEffect(() => {
		setClientHeight(document.getElementById(id)?.clientHeight ?? 0);
	}, []);

	return (
		<div className="flex h-full">
			{isSidebarOpen && (
				<div className="bg-white dark:bg-gray-800 w-3/12">
					<div className="flex dark:bg-gray-700 flex-col gap-2 p-4">
						<Text>Inventory PT. IMI</Text>
						<div className="flex items-center gap-2">
							<Icon name="faUserCircle" className="text-3xl" />

							<Text>Admin</Text>
						</div>
					</div>
					<SideBar />
				</div>
			)}
			<div className="h-full flex flex-1 flex-col relative">
				<Header />
				<div id={id} className="flex flex-1"></div>
				<div
					style={{height: clientHeight}}
					className="absolute flex bottom-0 w-full">
					<div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-300">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
}
