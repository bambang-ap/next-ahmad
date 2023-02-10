import {signOut} from 'next-auth/react';

import {Button} from '@components';
import {useAuth} from '@hooks';

export default function Header() {
	useAuth();

	return (
		<div className="w-full h-10">
			<Button onClick={() => signOut({redirect: false})}>Logout</Button>
		</div>
	);
}
