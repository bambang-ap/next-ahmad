import {getLayout} from '@hoc';
import Dashboard from '@pageComponent/dashboard';

Index.getLayout = getLayout;

export default function Index() {
	return <Dashboard />;
}
