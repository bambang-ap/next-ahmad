import {Op} from 'sequelize';
import {z} from 'zod';

import {TKanban} from '@appTypes/app.zod';
import {OrmKanban} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';

export const kanbanImage = {
	image: procedure.input(z.string()).query(({ctx, input: id}) => {
		return checkCredentialV2(ctx, async () => {
			const image = await OrmKanban.findOne({
				where: {id},
				attributes: ['image'] as (keyof TKanban)[],
			});

			return image?.dataValues.image;
		});
	}),

	images: procedure.query(({ctx}) => {
		return checkCredentialV2(ctx, async () => {
			const images = await OrmKanban.findAll({
				where: {image: {[Op.ne]: null}},
				attributes: ['image', 'keterangan'] as (keyof TKanban)[],
			});

			return images?.map(({dataValues}) => {
				const {image, keterangan} = dataValues;

				return {image, keterangan};
			});
		});
	}),
};
