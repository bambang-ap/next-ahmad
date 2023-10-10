import {createContext, ReactNode, useLayoutEffect, useState} from 'react';

import {useTheme} from '@mui/material';
import {useSetRecoilState} from 'recoil';

import {SidebarCollapseOn} from '@constants';
import {atomIsMobile} from '@recoil/atoms';
type SidebarContext = {
	sidebarToggle: boolean;
	toggleSidebar: () => void;
	closeSidebar: () => void;
};

type Props = {
	children: ReactNode;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
	{} as SidebarContext,
);

export function SidebarProvider({children}: Props) {
	const theme = useTheme();
	const setIsMobile = useSetRecoilState(atomIsMobile);

	const [sidebarToggle, setSidebarToggle] = useState(true);

	const toggleSidebar = () => {
		setSidebarToggle(!sidebarToggle);
	};

	const closeSidebar = () => {
		setSidebarToggle(false);
	};

	function handleResize() {
		const {[SidebarCollapseOn]: width} = theme.breakpoints.values;
		if (window.innerWidth <= width) {
			setSidebarToggle(false);
			setIsMobile(true);
		} else {
			setSidebarToggle(true);
			setIsMobile(false);
		}
	}

	useLayoutEffect(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<SidebarContext.Provider
			value={{sidebarToggle, toggleSidebar, closeSidebar}}>
			{children}
		</SidebarContext.Provider>
	);
}
