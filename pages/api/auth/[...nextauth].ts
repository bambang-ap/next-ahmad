import NextAuth, {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import {TSession, TUser} from '@appTypes/app.type';
import {OrmUser} from '@database';

export const authOptions: NextAuthOptions = {
	secret: process.env.AUTH_SECRET,
	session: {strategy: 'jwt'},
	providers: [
		CredentialsProvider({
			type: 'credentials',
			credentials: {},
			async authorize(credentials) {
				const {email, password} = credentials as {
					email: string;
					password: string;
				};

				// @ts-ignore
				const user = (await OrmUser.findOne({
					where: {email, password},
				})) as TUser;

				if (!user) throw new Error('invalid credentials');

				const {role, id, name} = user;

				return {id, name, email, role};
			},
		}),
	],
	pages: {
		signIn: '/auth/signin',
	},
	callbacks: {
		async session(params) {
			const session: TSession = {
				...params.session,
				// @ts-ignore
				user: (await OrmUser.findOne({
					// @ts-ignore
					where: {email: params.token.email},
				})) as TUser,
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
