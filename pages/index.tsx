import {trpc} from 'src/utils/trpc';

export default function Home() {
	// useAuth();

	const hello = trpc.hello.useQuery({text: 'client'});
	console.log(hello.data);
	return null;
}
