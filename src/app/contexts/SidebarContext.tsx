import {createContext, ReactNode, useLayoutEffect, useState} from "react";

import {useTheme} from "@mui/material";

import {SidebarCollapseOn} from "@constants";
type SidebarContext = {
	sidebarToggle: boolean;
	toggleSidebar: () => void;
	closeSidebar: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const SidebarContext = createContext<SidebarContext>(
	{} as SidebarContext,
);

type Props = {
	children: ReactNode;
};

export function SidebarProvider({children}: Props) {
	const theme = useTheme();
	const [sidebarToggle, setSidebarToggle] = useState(true);

	const toggleSidebar = () => {
		setSidebarToggle(!sidebarToggle);
	};

	const closeSidebar = () => {
		setSidebarToggle(false);
	};

	function handleResize() {
		const {[SidebarCollapseOn]: width} = theme.breakpoints.values;
		if (window.innerWidth < width) setSidebarToggle(false);
		else setSidebarToggle(true);
	}

	useLayoutEffect(() => {
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<SidebarContext.Provider
			value={{sidebarToggle, toggleSidebar, closeSidebar}}>
			{children}
		</SidebarContext.Provider>
	);
}
