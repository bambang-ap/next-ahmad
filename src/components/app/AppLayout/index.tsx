import {PropsWithChildren} from 'react';

import {useRecoilValue} from 'recoil';

import {atomSidebarOpen} from '@recoil/atoms';

import Header from './Header';
import {SideBar} from './SideBar';

export default function AppLayout({children}: PropsWithChildren) {
	const isSidebarOpen = useRecoilValue(atomSidebarOpen);

	return (
		<div className="flex flex-col h-full">
			<Header />
			<div className="flex flex-1">
				{isSidebarOpen && (
					<div className="h-full flex flex-col" style={{flex: 0.5}}>
						<div className="relative flex-1">
							<div className="absolute top-0 right-0 bottom-0 left-0 overflow-y-auto bg-gray-200 dark:bg-gray-900">
								<SideBar />
							</div>
						</div>
					</div>
				)}
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
