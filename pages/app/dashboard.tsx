import {AccountBalance} from "@mui/icons-material";
import {Container, Grid} from "@mui/material";
import Head from "next/head";

import AccountSecurity from "@app/content/Dashboards/Crypto/AccountSecurity";
import PageHeader from "@app/content/Dashboards/Crypto/PageHeader";
import Wallets from "@app/content/Dashboards/Crypto/Wallets";
import WatchList from "@app/content/Dashboards/Crypto/WatchList";
import {SidebarLayout} from "@layouts";
import Footer from "@prevComp/Footer";
import PageTitleWrapper from "@prevComp/PageTitleWrapper";

function DashboardCrypto() {
	return (
		<>
			<Head>
				<title>Crypto Dashboard</title>
			</Head>
			<PageTitleWrapper>
				<PageHeader />
			</PageTitleWrapper>
			<Container maxWidth="lg">
				<Grid
					container
					direction="row"
					justifyContent="center"
					alignItems="stretch"
					spacing={4}>
					<Grid item xs={12}>
						<AccountBalance />
					</Grid>
					<Grid item lg={8} xs={12}>
						<Wallets />
					</Grid>
					<Grid item lg={4} xs={12}>
						<AccountSecurity />
					</Grid>
					<Grid item xs={12}>
						<WatchList />
					</Grid>
				</Grid>
			</Container>
			<Footer />
		</>
	);
}

DashboardCrypto.getLayout = page => <SidebarLayout>{page}</SidebarLayout>;

export default DashboardCrypto;
