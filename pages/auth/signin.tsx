import {useEffect, useState} from 'react';

import {signIn} from 'next-auth/react';
import {useRouter} from 'next/router';
import {useForm} from 'react-hook-form';

import {TUserSignIn} from '@appTypes/app.type';
import {Button, Input} from '@components';
import {useSession} from '@hooks';

export default function SignIn() {
	const {status} = useSession();
	const {replace} = useRouter();

	const {control, handleSubmit, reset} = useForm<TUserSignIn>();

	const [usingQr, setUsingQr] = useState(false);

	const onSubmit = handleSubmit(async ({email, password, token}) => {
		await signIn('credentials', {email, password, token, redirect: false});
	});

	useEffect(() => {
		if (status === 'authenticated') replace('/app');
	}, [status, replace]);

	function toggleMethod() {
		setUsingQr(v => !v);
	}

	return (
		<div className="h-full flex flex-col justify-center items-center">
			<div className="flex flex-row-reverse w-2/3 rounded overflow-hidden">
				<div className="flex flex-1 bg-neutral-600">
					<img src="/assets/login-bg.jpg" />
				</div>
				<form
					className="flex flex-col flex-1 bg-neutral-300 p-4 justify-center gap-y-2"
					onSubmit={onSubmit}>
					<img src="/assets/logo-imi.png" />
					{usingQr ? (
						<Input shouldUnregister control={control} fieldName="token" />
					) : (
						<>
							<Input shouldUnregister control={control} fieldName="email" />
							<Input
								shouldUnregister
								type="password"
								control={control}
								fieldName="password"
							/>
						</>
					)}
					<div className="flex gap-2">
						<Button className="flex-1" type="submit">
							Login
						</Button>
						<Button className="flex-1" onClick={toggleMethod}>
							{`Login Using ${usingQr ? 'Form' : 'QR'}`}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
