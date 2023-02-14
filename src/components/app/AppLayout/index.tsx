import {PropsWithChildren, useEffect, useState} from 'react';

import {useRecoilValue} from 'recoil';

import {atomSidebarOpen} from '@recoil/atoms';

import Header from './Header';
import {SideBar} from './SideBar';

const id = 'jhsdf';

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
					<div className="overflow-y-auto w-1/6">
						<SideBar />
					</div>
				)}
				<div className="flex-1 overflow-y-auto">{children}</div>
			</div>
		</div>
	);

	return (
		<div className="flex flex-col h-full">
			<Header />
			<div className="flex">
				<SideBar />
				{children}
			</div>

			<div className="flex flex-1">
				{/* {isSidebarOpen && (
					<div className="h-full flex flex-col" style={{flex: 0.5}}>
						<div className="relative flex-1">
							<div className="absolute top-0 right-0 bottom-0 left-0 overflow-y-auto bg-gray-200 dark:bg-gray-900">
								<SideBar />
							</div>
						</div>
					</div>
				)} */}
				<div className="flex-1 h-full flex flex-col">
					<div className="relative flex-1">
						<div className="absolute top-0 right-0 bottom-0 left-0 overflow-y-auto p-4 bg-white dark:bg-gray-900">
							{children}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
