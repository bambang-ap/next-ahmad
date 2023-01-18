import {signOut} from 'next-auth/react';

import {useAuth} from '@hooks';

export default function Header() {
	useAuth();

	return (
		<div className="w-full h-10">
			<button onClick={() => signOut({redirect: false})}>Logout</button>
		</div>
	);
}
