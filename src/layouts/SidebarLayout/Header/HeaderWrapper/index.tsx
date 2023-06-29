import {useContext, useEffect} from "react";

import CloseTwoToneIcon from "@mui/icons-material/CloseTwoTone";
import MenuTwoToneIcon from "@mui/icons-material/MenuTwoTone";
import {
	alpha,
	Box,
	IconButton,
	lighten,
	styled,
	Tooltip,
	useTheme,
} from "@mui/material";
import Head from "next/head";
import {useRouter} from "next/router";
import {useRecoilState} from "recoil";

import {SidebarContext} from "@app/contexts/SidebarContext";
import {Text} from "@components";
import {SidebarCollapseOn} from "@constants";
import {useAuth, useMenu} from "@hooks";
import {atomHeaderTitle} from "@recoil/atoms";
import {classNames} from "@utils";

const HeaderWrapper = styled(Box)(
	({theme}) => `
        height: ${theme.header.height};
        color: ${theme.header.textColor};
        padding: ${theme.spacing(0, 2)};
        right: 0;
        z-index: 6;
        background-color: ${alpha(theme?.header?.background ?? "", 0.95)};
        backdrop-filter: blur(3px);
        position: fixed;
        justify-content: space-between;
        width: 100%;
        @media (min-width: ${theme.breakpoints.values[SidebarCollapseOn]}px) {
            left: ${theme.sidebar.width};
            width: auto;
        }
`,
);

function Header() {
	useAuth();

	const theme = useTheme();
	const [titleAtom, setTitle] = useRecoilState(atomHeaderTitle);

	const {asPath} = useRouter();
	const {unMappedMenu} = useMenu();
	const {sidebarToggle, toggleSidebar} = useContext(SidebarContext);

	const selectedMenu = unMappedMenu?.find(e => e.path === asPath);
	const title = selectedMenu?.title ?? titleAtom;

	useEffect(() => {
		if (!!selectedMenu?.title) setTitle("");
	}, [selectedMenu?.title]);

	return (
		<>
			<Head>
				<title>{classNames("IMI Inventory", {[`- ${title}`]: title})}</title>
			</Head>
			<HeaderWrapper
				display="flex"
				alignItems="center"
				sx={{
					boxShadow:
						theme.palette.mode === "dark"
							? `0 1px 0 ${alpha(
									lighten(theme.colors.primary.main, 0.7),
									0.15,
							  )}, 0px 2px 8px -3px rgba(0, 0, 0, 0.2), 0px 5px 22px -4px rgba(0, 0, 0, .1)`
							: `0px 2px 8px -3px ${alpha(
									theme.colors.alpha.black[100],
									0.2,
							  )}, 0px 5px 22px -4px ${alpha(
									theme.colors.alpha.black[100],
									0.1,
							  )}`,
				}}>
				<Text className="flex-1">{title?.toUpperCase()}</Text>
				{/* <Stack
				direction="row"
				divider={<Divider orientation="vertical" flexItem />}
				alignItems="center"
				spacing={2}
			/> */}
				<Box display="flex" alignItems="center">
					{/* <HeaderButtons /> */}
					{/* <HeaderUserbox /> */}
					<Box
						component="span"
						sx={{
							ml: 2,
							display: {[SidebarCollapseOn]: "none", xs: "inline-block"},
						}}>
						<Tooltip arrow title="Toggle Menu">
							<IconButton color="primary" onClick={toggleSidebar}>
								{!sidebarToggle ? (
									<MenuTwoToneIcon fontSize="small" />
								) : (
									<CloseTwoToneIcon fontSize="small" />
								)}
							</IconButton>
						</Tooltip>
					</Box>
				</Box>
			</HeaderWrapper>
		</>
	);
}

export default Header;
