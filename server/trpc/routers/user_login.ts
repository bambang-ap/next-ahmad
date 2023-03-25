import moment from 'moment';
import {Op} from 'sequelize';
import {z} from 'zod';

import {tUser, tUserSignIn} from '@appTypes/app.zod';
import {OrmUser, OrmUserLogin} from '@database';
import {generateId} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

const user_loginRouters = router({
	get: procedure
		.input(z.object({where: tUser.partial()}))
		.query(async ({input: {where}}) => {
			const user = await OrmUser.findOne({where});

			if (!user) return null;

			return user?.dataValues;
		}),
	login: procedure
		.input(tUserSignIn)
		.query(async ({input: {token, email, password}}) => {
			let userData: OrmUser | null;

			console.log({token, email, password});

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

			findUser: {
				if (token) break findUser;

				userData = await OrmUser.findOne({where: {password, email}});
			}

			if (!userData)
				throw new TRPCError({code: 'NOT_FOUND', message: 'User not found'});

			return userData.dataValues;
		}),
	generate: procedure.input(z.string()).mutation(async ({input: id_user}) => {
		const expiredAt = moment().add(1, 'month').toDate();
		const hasData = await OrmUser.findOne({where: {id: id_user}});

		if (!hasData) throw new TRPCError({code: 'UNAUTHORIZED'});

		const hasDataLogin = await OrmUserLogin.findOne({
			where: {id_user},
		});

		const [retValue] = await OrmUserLogin.upsert({
			id_user,
			expiredAt,
			id: hasDataLogin?.dataValues.id || generateId(),
		});

		return retValue;
	}),
});

export default user_loginRouters;
