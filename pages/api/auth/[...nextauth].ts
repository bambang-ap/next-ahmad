import NextAuth, {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import {TSession} from '@appTypes/app.type';

const role = 'user';

export const authOptions: NextAuthOptions = {
	secret: process.env.AUTH_SECRET,
	session: {strategy: 'jwt'},
	providers: [
		CredentialsProvider({
			type: 'credentials',
			credentials: {},
			authorize(credentials) {
				const {email, password} = credentials as {
					email: string;
					password: string;
				};
				// perform you login logic
				// find out user from db
				if (email !== 'john@gmail.com' || password !== '1234') {
					throw new Error('invalid credentials');
				}

				// if everything is fine
				return {
					id: '1234',
					name: 'John Doe',
					email: 'john@gmail.com',
					role,
				};
			},
		}),
	],
	pages: {
		signIn: '/auth/signin',
	},
	callbacks: {
		session(params) {
			const session: TSession = {
				...params.session,
				user: {id: '1234', email: 'sdhf', name: 'dsfdsfdsf', role},
			};
			return session;
		},
		jwt(params) {
			// update token
			if (params.user?.role) {
				params.token.role = params.user.role;
			}

			// return final_token
			return params.token;
		},
	},
};

export default NextAuth(authOptions);
