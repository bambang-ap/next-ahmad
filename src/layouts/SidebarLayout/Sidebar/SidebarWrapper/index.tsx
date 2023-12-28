import {useContext} from 'react';

import {
	alpha,
	Box,
	Button,
	darken,
	Divider,
	Drawer,
	lighten,
	styled,
	useTheme,
} from '@mui/material';
import {signOut} from 'next-auth/react';

import {SidebarContext} from '@app/contexts/SidebarContext';
import {Icon, Text} from '@components';
import {IMIConst, isProd, SidebarCollapseOn} from '@constants';
import {PATHS} from '@enum';
import {useRouter, useSession} from '@hooks';
import Scrollbar from '@prevComp/Scrollbar';

import SidebarMenu from '../SidebarMenu';

const SidebarWrapper = styled(Box)(
	({theme}) => `
        width: ${theme.sidebar.width};
        min-width: ${theme.sidebar.width};
        color: ${theme.colors.alpha.trueWhite[70]};
        position: relative;
        z-index: 7;
        height: 100%;
        padding-bottom: 68px;
`,
);

function RenderSidebar() {
	const theme = useTheme();
	const {data} = useSession();
	const {push} = useRouter();

	return (
		<>
			<Scrollbar>
				<Box mt={3}>
					<Box mx={2}>
						<div className="flex rounded-lg flex-col gap-2 p-4">
							<Text>{IMIConst.title}</Text>
							<div className="flex items-center gap-2">
								<Icon name="faUserCircle" className="text-3xl" />

								<Text>{data?.user?.name}</Text>
							</div>
						</div>
					</Box>
				</Box>
				<Divider
					sx={{
						mt: theme.spacing(3),
						mx: theme.spacing(2),
						background: theme.colors.alpha.trueWhite[10],
					}}
				/>
				<SidebarMenu />
			</Scrollbar>
			<Divider
				sx={{
					background: theme.colors.alpha.trueWhite[10],
				}}
			/>
			<Box className="flex gap-2" p={2}>
				<Button
					onClick={() => signOut({redirect: false})}
					variant="contained"
					color="error"
					size="small"
					fullWidth>
					Sign Out
				</Button>
				{!isProd && (
					<Button
						onClick={() => push(PATHS.app_scan_remove)}
						variant="contained"
						color="primary"
						size="small"
						fullWidth>
						Remove Scan
					</Button>
				)}
			</Box>
		</>
	);
}

function Sidebar() {
	const {sidebarToggle, toggleSidebar} = useContext(SidebarContext);
	const closeSidebar = () => toggleSidebar();
	const theme = useTheme();

	return (
		<>
			<SidebarWrapper
				sx={{
					display: {
						xs: 'none',
						[SidebarCollapseOn]: sidebarToggle ? 'inline-block' : 'none',
					},
					position: 'fixed',
					left: 0,
					top: 0,
					background:
						theme.palette.mode === 'dark'
							? alpha(lighten(theme.header.background ?? '', 0.1), 0.5)
							: darken(theme.colors.alpha.black[100], 0.5),
					boxShadow:
						theme.palette.mode === 'dark' ? theme.sidebar.boxShadow : 'none',
				}}>
				<RenderSidebar />
			</SidebarWrapper>
			<Drawer
				sx={{
					display: {
						xs: 'inline-block',
						[SidebarCollapseOn]: 'none',
					},
					boxShadow: `${theme.sidebar.boxShadow}`,
				}}
				anchor={theme.direction === 'rtl' ? 'right' : 'left'}
				open={sidebarToggle}
				onClose={closeSidebar}
				variant="temporary"
				elevation={9}>
				<SidebarWrapper
					sx={{
						background:
							theme.palette.mode === 'dark'
								? theme.colors.alpha.white[100]
								: darken(theme.colors.alpha.black[100], 0.5),
					}}>
					<RenderSidebar />
				</SidebarWrapper>
			</Drawer>
		</>
	);
}

export default Sidebar;
