import {getLayout} from '@hoc';
import {useFetchUser} from '@queries';

export default function User() {
	const {data} = useFetchUser();

	console.log(data);

	return null;
}

User.getLayout = getLayout;
