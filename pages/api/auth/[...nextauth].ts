import NextAuth, {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {ORM} from 'server/database/_init';

import {TSession, TUser} from '@appTypes/app.type';
import {ormUserAttributes} from '@database';

const [attributes, options] = ormUserAttributes();
const OrmUser = ORM.define('UserAuth', attributes, options);

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
				const user: TUser = await OrmUser.findOne({where: {email, password}});

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
		// @ts-ignore
		async session(params) {
			const session: TSession = {
				...params.session,
				// @ts-ignore
				user: await OrmUser.findOne({
					// @ts-ignore
					where: {email: params.token.email},
				}),
			};
			return session;
		},
		jwt(params) {
			// @ts-ignore Update token
			if (params.user?.role) {
				// @ts-ignore
				params.token.role = params.user.role;
			}

			// return final_token
			return params.token;
		},
	},
};

export default NextAuth(authOptions);
