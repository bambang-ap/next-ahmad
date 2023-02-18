import {trpc} from '@utils/trpc';

export default function Home() {
	// useAuth();

	const hello = trpc.customer_po.useQuery();

	console.log(hello?.data);

	return null;
}
