import React from 'react';
import {PropsWithChildren} from 'react';

import Header from './Header';
import {SideBar} from './SideBar';

export default function AppLayout({children}: PropsWithChildren) {
	return (
		<div className="flex h-full">
			<SideBar />
			<div className="flex-col w-full">
				<Header />
				<div className="w-full h-full overflow-y-auto">{children}</div>
			</div>
		</div>
	);
}
