import {getLayout} from '@hoc';
import DashboardTransaksi from '@pageComponent/dashboard/Transaksi';

Index.getLayout = getLayout;

export default function Index() {
	return <DashboardTransaksi />;
}
