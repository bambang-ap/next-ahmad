import {FC, ReactNode} from "react";

import {alpha, Box, lighten, useTheme} from "@mui/material";
import PropTypes from "prop-types";

import {SidebarCollapseOn} from "@constants";
import Scrollbar from "@prevComp/Scrollbar";

import Header from "../Header/HeaderWrapper";
import Sidebar from "../Sidebar/SidebarWrapper";

interface SidebarLayoutProps {
	children?: ReactNode;
}

export const SidebarLayout: FC<SidebarLayoutProps> = ({children}) => {
	const theme = useTheme();

	return (
		<Box
			className="h-full"
			sx={{
				".MuiPageTitle-wrapper": {
					background:
						theme.palette.mode === "dark"
							? theme.colors.alpha.trueWhite[5]
							: theme.colors.alpha.white[50],
					marginBottom: `${theme.spacing(4)}`,
					boxShadow:
						theme.palette.mode === "dark"
							? `0 1px 0 ${alpha(
									lighten(theme.colors.primary.main, 0.7),
									0.15,
							  )}, 0px 2px 4px -3px rgba(0, 0, 0, 0.2), 0px 5px 12px -4px rgba(0, 0, 0, .1)`
							: `0px 2px 4px -3px ${alpha(
									theme.colors.alpha.black[100],
									0.1,
							  )}, 0px 5px 12px -4px ${alpha(
									theme.colors.alpha.black[100],
									0.05,
							  )}`,
				},
			}}>
			<Header />
			<Sidebar />
			<Box
				className="h-full"
				sx={{
					position: "relative",
					zIndex: 5,
					display: "block",
					flex: 1,
					pt: `${theme.header.height}`,
					[theme.breakpoints.up(SidebarCollapseOn)]: {
						ml: `${theme.sidebar.width}`,
					},
				}}>
				<Box display="block" className="p-4 h-full">
					<Scrollbar>{children}</Scrollbar>
				</Box>
			</Box>
		</Box>
	);
};

SidebarLayout.propTypes = {
	children: PropTypes.node,
};
