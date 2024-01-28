import {getLayout} from '@hoc';
import {useSession} from '@hooks';

Index.getLayout = getLayout;

export default function Index() {
	const {data} = useSession();

	return <div>Selamat datang {data?.user?.name}</div>;
}
