import moment from 'moment';
import {Op} from 'sequelize';
import {z} from 'zod';

import {OrmUser, OrmUserLogin} from '@database';
import {generateId} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

const user_loginRouters = router({
	login: procedure
		.input(z.string().optional())
		.query(async ({input: token}) => {
			const hasData = await OrmUserLogin.findOne({
				where: {
					id: token,
					expiredAt: {[Op.gte]: moment().toDate()},
				},
			});

			if (hasData) return true;

			throw new TRPCError({code: 'UNAUTHORIZED'});
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
