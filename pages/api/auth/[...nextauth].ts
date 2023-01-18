import {ROLE} from '@enum';
import NextAuth, {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import {Session} from '@appTypes/app.type';

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
					role: 'admin',
				};
			},
		}),
	],
	pages: {
		signIn: '/auth/signin',
	},
	callbacks: {
		session(params) {
			const session: Session = {
				...params.session,
				user: {id: '1234', username: 'abcdefg', role: ROLE.ADMIN},
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
