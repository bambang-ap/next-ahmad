import React from 'react';
import {PropsWithChildren} from 'react';

import {d} from 'pages/app/index';
import {useRecoilValue} from 'recoil';

import {SideBar} from './SideBar';

export const AppLayout = ({children}: PropsWithChildren) => {
	const ss = useRecoilValue(d);
	console.log(ss);

	return (
		<div className="flex">
			<SideBar />
			<div className="flex-col">
				{children}
				<div>{ss}</div>
			</div>
		</div>
	);
};
