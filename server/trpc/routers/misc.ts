import bufferToDataUrl from 'buffer-to-data-url';
import md5 from 'md5';
import qr, {image_type} from 'qr-image';
import {z} from 'zod';

import {tCustomer, TUser, zMd5} from '@appTypes/app.zod';
import {isProd, Success} from '@constants';
import {attrParserV2, dCust, dKanban, dPo, dSJIn, dUser, ORM} from '@database';
import {generateId, getNow} from '@server';
import {procedure, router} from '@trpc';
import {TRPCError} from '@trpc/server';

const qrInput = z.string().or(z.string().array()).optional();

const miscRouter = {
	test: procedure.query(async () => {
		const po = attrParserV2(dPo.unscoped(), ['nomor_po']);
		const cust = attrParserV2(dCust, ['name']);
		const sjIn = attrParserV2(dSJIn, ['id', 'nomor_surat']);
		const knb = attrParserV2(dKanban.unscoped(), [
			'id',
			'index_number',
			'nomor_kanban',
		]);

		const data = await po.model.findAll({
			logging: true,
			where: {
				'$dPo.nomor_po$': ['5311002826', '5311002685', '2024010084'],
				'$dSJIns.nomor_surat$': ['4909060605541'],
			},
			include: [
				{
					...sjIn,
					include: [
						{...knb, separate: true, include: [{...po, include: [cust]}]},
					],
				},
				cust,
			],
		});

		const data2 = await knb.model.findAll({
			where: {id: ['KNB_240119a89f']},
			include: [{...po, include: [cust]}],
		});

		return {data, data2};
	}),
	changeToMd5: procedure.query(async () => {
		if (isProd) throw new TRPCError({code: 'BAD_REQUEST'});

		const transaction = await ORM.transaction();

		try {
			const userData = await dUser.findAll({
				attributes: {include: ['password'] as (keyof TUser)[]},
			});

			const promisedUserData = userData.map(e => {
				const val = e.toJSON();

				if (zMd5.safeParse(val.password!).success) return;
				return dUser.update(
					{...val, password: md5(val.password!)},
					{transaction, where: {id: val.id}},
				);
			});

			await Promise.all(promisedUserData);

			await transaction.commit();
			return Success;
		} catch (err) {
			await transaction.rollback();
			throw new TRPCError({code: 'PARSE_ERROR'});
		}
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
				schemaname, indexname, tablename, format('drop index %I.%I;', schemaname, indexname) as drop_statement
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
			function generateQr(type: image_type, inputStr?: string) {
				if (!inputStr) return null;

				const qrImage = qr.imageSync(inputStr, {type});

				if (type === 'svg') return `data:image/svg+xml;utf8,${qrImage}`;

				// @ts-ignore
				return bufferToDataUrl(`image/${type}`, qrImage);
			}

			function renderQrGenerated(
				inputStr?: string | string[],
				type: image_type = 'png',
			) {
				if (Array.isArray(inputStr))
					return inputStr.map(strInput => generateQr(type, strInput));

				return generateQr(type, inputStr);
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
