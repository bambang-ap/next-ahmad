import {FormEventHandler, useState} from 'react';
import {useEffect} from 'react';

import {signIn, useSession} from 'next-auth/react';
import {useRouter} from 'next/router';

export default function SignIn() {
	const {status} = useSession();
	const {replace} = useRouter();

	const [userInfo, setUserInfo] = useState({email: '', password: ''});
	const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
		// validate your userinfo
		e.preventDefault();

		const res = await signIn('credentials', {
			email: userInfo.email,
			password: userInfo.password,
			redirect: false,
		});

		console.log(res);
	};

	useEffect(() => {
		if (status === 'authenticated') replace('/app');
	}, [status, replace]);

	return (
		<div className="sign-in-form">
			<form onSubmit={handleSubmit}>
				<h1>Login</h1>
				<input
					value={userInfo.email}
					onChange={({target}) =>
						setUserInfo({...userInfo, email: target.value})
					}
					type="email"
					placeholder="john@email.com"
				/>
				<input
					value={userInfo.password}
					onChange={({target}) =>
						setUserInfo({...userInfo, password: target.value})
					}
					type="password"
					placeholder="********"
				/>
				<input type="submit" value="Login" />
			</form>
		</div>
	);
}
