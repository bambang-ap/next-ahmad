import {useEffect} from 'react';

import {signIn} from 'next-auth/react';
import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';

import {TUser} from '@appTypes/app.zod';
import {Button, Input} from '@components';
import {useSession} from '@hooks';

export default function SignIn() {
	const {status} = useSession();
	const {replace} = useRouter();

	const {control, handleSubmit} = useForm<Pick<TUser, 'email' | 'password'>>();

	const onSubmit = handleSubmit(async ({email, password}) => {
		await signIn('credentials', {email, password, redirect: false});
	});

	useEffect(() => {
		if (status === 'authenticated') replace('/app');
	}, [status, replace]);

	return (
		<div className="h-full flex flex-col justify-center items-center">
			<div className="flex w-1/2 rounded overflow-hidden">
				<form
					className="flex flex-col flex-1 bg-neutral-300 p-4 justify-center gap-y-2"
					onSubmit={onSubmit}>
					<img src="/assets/logo-imi.png" />
					<Input control={control} fieldName="email" />
					<Input type="password" control={control} fieldName="password" />
					<Button type="submit">Login</Button>
				</form>
				<div className="flex flex-1 bg-neutral-600">
					<img src="/assets/login-bg.jpg" />
				</div>
			</div>
		</div>
	);
}
