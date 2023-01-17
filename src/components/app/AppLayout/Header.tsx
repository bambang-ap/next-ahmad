import {useAuth} from '@hooks';
import {signOut} from 'next-auth/react';

export default function Header() {
	useAuth();
	return (
		<div className="w-full h-10">
			<button onClick={() => signOut({redirect: false})}>Logout</button>
		</div>
	);
}
