import bufferToDataUrl from 'buffer-to-data-url';
import qr, {image_type} from 'qr-image';
import {Op} from 'sequelize';
import {z} from 'zod';

import {tCustomer} from '@appTypes/app.zod';
import {isProd} from '@constants';
import {
	attrParserV2,
	ORM,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmKanban,
	OrmKanbanItem,
	OrmMenu,
	OrmPOItemSppbIn,
	wherePagesV4,
} from '@database';
import {checkCredentialV2, generateId, getNow} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

const qrInput = z.string().or(z.string().array()).optional();

const miscRouter = {
	test: procedure.query(() => {
		return OrmCustomerPO.findAll({
			limit: 3,
			logging: true,
			include: [
				OrmCustomer,
				{
					separate: true,
					model: OrmCustomerSPPBIn,
					include: [
						{
							model: OrmPOItemSppbIn,
							separate: true,
							include: [
								{model: OrmKanbanItem, separate: true, include: [OrmKanban]},
							],
						},
					],
				},
			],
		});
	}),
	menuu: procedure.query(({ctx}) => {
		// TODO: refactor useMenu using this method
		const menu = attrParserV2(OrmMenu, ['title', 'parent_id', 'accepted_role']);
		const menuChild = attrParserV2(OrmMenu, ['title', 'accepted_role']);

		type Ret = typeof menu.obj & {
			OrmMenus: (typeof menuChild.obj & {
				OrmMenus: typeof menuChild.obj[];
			})[];
		};

		return checkCredentialV2(ctx, async session => {
			const {count, rows} = await menu.model.findAndCountAll({
				attributes: menu.attributes,
				include: [{...menuChild, include: [menuChild]}],
				where: wherePagesV4<Ret>(
					{
						parent_id: {[Op.is]: null},
					},
					[
						'or',
						{
							accepted_role: {[Op.substring]: session?.user?.role},
							'$OrmMenus.accepted_role$': {
								[Op.substring]: session?.user?.role,
							},
							'$OrmMenus.OrmMenus.accepted_role$': {
								[Op.substring]: session?.user?.role,
							},
						},
					],
				),
			});

			return {count, data: rows.map(e => e.toJSON() as unknown as Ret)};
		});
	}),
	statsActivity: procedure.query(async () => {
		if (isProd) throw new TRPCError({code: 'NOT_FOUND'});
		const [queries] = await ORM.query(
			"SELECT * FROM pg_stat_activity WHERE wait_event IS NOT NULL AND backend_type = 'client backend';",
		);

		return {count: queries.length, queries};
	}),
	dropTables: procedure.query(async () => {
		if (isProd) throw new TRPCError({code: 'NOT_FOUND'});
		const [queries] = await ORM.query(
			"select 'drop table if exists \"' || tablename || '\" cascade;' as query from pg_tables where schemaname = 'public' LIMIT 100 OFFSET 0",
		);

		// @ts-ignore
		return queries.map(e => e.query).join('');
	}),
	dropIndexes: procedure.query(async () => {
		if (isProd) throw new TRPCError({code: 'NOT_FOUND'});
		const [queries] = await ORM.query(
			`select 
			schemaname, indexname, 			tablename, 			format('drop index %I.%I;',
			schemaname, indexname) as drop_statement
from pg_indexes
where schemaname not in ('pg_catalog', 'pg_toast')`,
		);

		// @ts-ignore
		return queries.map(e => e.drop_statement).join('');
	}),
	now: procedure.query(getNow),
	generateId: procedure
		.input(z.string().optional())
		.query(({input}) => generateId(input)),
	qr: procedure
		.input(
			qrInput.or(
				z.object({
					type: z.enum(['png', 'svg', 'pdf', 'eps']).optional(),
					input: qrInput,
				}),
			),
		)
		.query(({input}) => {
			function generateQr(type: image_type, input?: string) {
				if (!input) return null;

				const qrImage = qr.imageSync(input, {type});

				if (type === 'svg') return `data:image/svg+xml;utf8,${qrImage}`;

				// @ts-ignore
				return bufferToDataUrl(`image/${type}`, qrImage);
			}

			function renderQrGenerated(
				input?: string | string[],
				type: image_type = 'png',
			) {
				if (Array.isArray(input))
					return input.map(input => generateQr(type, input));

				return generateQr(type, input);
			}

			if (!input) return null;

			if (typeof input === 'string' || Array.isArray(input))
				return renderQrGenerated(input);

			return renderQrGenerated(input.input, input.type);
		}),
	exampleData: router({
		get: procedure.input(z.enum(['customer'])).query(({input}) => {
			switch (input) {
				case 'customer':
					return generateShape(tCustomer);
				default:
					throw new TRPCError({code: 'BAD_REQUEST'});
			}

			function generateShape<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
				return [
					Object.keys(schema.shape).reduce<MyObject>((ret, key) => {
						if (key === 'id') return ret;

						return {...ret, [key]: ''};
					}, {}),
				];
			}
		}),
	}),
};

export default miscRouter;
