import {PropsWithChildren, useEffect, useState} from 'react';

import {useRecoilValue} from 'recoil';

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
		<div className="h-full flex flex-col relative">
			<Header />
			<div id={id} className="flex flex-1"></div>
			<div
				style={{height: clientHeight}}
				className="absolute flex bottom-0 w-full">
				{isSidebarOpen && (
					<div className="overflow-y-auto bg-white dark:bg-gray-800 w-3/12">
						<SideBar />
					</div>
				)}
				<div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-300">
					{children}
				</div>
			</div>
		</div>
	);
}
