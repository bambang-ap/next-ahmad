import moment from 'moment';
import NextAuth, {NextAuthOptions} from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import {Op} from 'sequelize';

import {TSession, TUserSignIn} from '@appTypes/app.type';
import {
	ORM,
	OrmUser as UserOrm,
	ormUserAttributes,
	ormUserLoginAttributes,
} from '@database';
import {TRPCError} from '@trpc/server';

const OrmUser = ORM.define('UserAuth', ...ormUserAttributes());
const OrmUserLogin = ORM.define('UseLoginrAuth', ...ormUserLoginAttributes());

export const authOptions: NextAuthOptions = {
	secret: process.env.AUTH_SECRET,
	session: {strategy: 'jwt'},
	providers: [
		CredentialsProvider({
			type: 'credentials',
			credentials: {},
			async authorize(credential = {}) {
				let userData: UserOrm | null;

				const {email, token, password} = Object.entries(credential).reduce(
					(ret, [key, value]) => {
						// @ts-ignore
						if (value !== 'undefined') ret[key] = value;
						return ret;
					},
					{} as TUserSignIn,
				);

				findUser: {
					if (token) break findUser;

					userData = await OrmUser.findOne({where: {password, email}});
				}

				tokenChecker: {
					if (!token) break tokenChecker;

					const hasToken = await OrmUserLogin.findOne({
						where: {
							id: token,
							expiredAt: {[Op.gte]: moment().toDate()},
						},
					});

					if (!hasToken) {
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: 'Token not found',
						});
					}

					userData = await OrmUser.findOne({
						where: {id: hasToken.dataValues.id_user},
					});
				}

				if (!userData!)
					throw new TRPCError({code: 'NOT_FOUND', message: 'User not found'});

				return userData.dataValues;
			},
		}),
	],
	pages: {
		signIn: '/auth/signin',
	},
	callbacks: {
		// @ts-ignore
		async session(params) {
			const user = await OrmUser.findOne({
				where: {email: params.token.email!},
			});

			const session: TSession = {
				...params.session,
				user: user?.dataValues,
			};

			return session;
		},
		jwt(params) {
			// @ts-ignore update token add role to token
			if (params.user?.role) params.token.role = params.user?.role;

			// return final_token
			return params.token;
		},
	},
};

export default NextAuth(authOptions);
