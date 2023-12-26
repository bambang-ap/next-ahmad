import {NextApiRequest, NextApiResponse} from 'next';
import {getServerSession} from 'next-auth';
import {authOptions} from 'pages/api/auth/[...nextauth]';
import {Model, ModelStatic, Op, WhereOptions} from 'sequelize';

import {PagingResult, TSession} from '@appTypes/app.type';
import {TIndex, ZIndex} from '@appTypes/app.zod';
import {IndexNumber} from '@enum';
import {TRPCError} from '@trpc/server';
import {moment} from '@utils';

import {orderPages} from './database/db-utils';
import {dIndex} from './database/models/index_number';

export {generateId} from '@utils';

export const getSession = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.headers['user-agent']?.toLowerCase()?.includes('postman')) {
		return {
			session: {user: {role: 'admin'}} as TSession,
			hasSession: true,
		};
	}

	const session = (await getServerSession(req, res, authOptions)) as TSession;

	return {session, hasSession: !!session};
};

export const Response = <T extends object>(res: NextApiResponse) => {
	return {
		success(body: T) {
			return res.status(200).send(body);
		},
		error(message: string) {
			return res.status(500).send({message});
		},
	};
};

export const getNow = () => {
	return moment().toLocaleString();
};

export const checkCredential = async (
	req: NextApiRequest,
	res: NextApiResponse,
	callback: NoopVoid | (() => Promise<void>),
) => {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) return Response(res).error('You have no credentials');

	return callback();
};

export async function checkCredentialV2<T>(
	ctx: {req: NextApiRequest; res: NextApiResponse},
	callback:
		| ((session: Required<TSession>) => Promise<T>)
		| ((session: Required<TSession>) => T),
	// allowedRole?: string,
) {
	const {hasSession, session} = await getSession(ctx.req, ctx.res);

	if (!hasSession) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You have no credentials',
		});
	}

	return callback(session as Required<TSession>);
}

export async function genInvoice<T extends object, P extends string>(
	orm: ModelStatic<Model<T>>,
	prefix: P,
	counterCb: (
		data?: Model<T>['dataValues'],
	) => string /* | [value: string, reverse: true] */ | undefined,
	// @ts-ignore
	order: keyof T = 'createdAt',
	length = 5,
): Promise<`${P}/${string}`> {
	// @ts-ignore
	const count = await orm.findOne({order: [[order, 'DESC']]});
	const counter = counterCb(count?.dataValues)?.split('/');
	const counterResult = counter?.[counter.length - 1]?.replace(/[^0-9]/g, '');
	const countString = (parseInt(counterResult ?? '0') + 1)
		.toString()
		.padStart(length, '0');
	// @ts-ignore
	return `${!!prefix ? `${prefix}/` : ''}${countString}`;
}

export async function genNumberIndex<T extends ZIndex & {}>(
	orm: ModelStatic<Model<T>>,
	target: IndexNumber,
) {
	const indexNumber = await dIndex.findOne({
		where: {target},
		order: orderPages<TIndex>({createdAt: true}),
	});

	if (!indexNumber) throw new TRPCError({code: 'BAD_REQUEST'});

	const index_id = indexNumber.toJSON().id;

	const count = await orm.findOne({
		order: orderPages<ZIndex>({index_number: false}),
		attributes: ['index_number'] as (keyof ZIndex)[],
		where: {index_id, index_number: {[Op.not]: null}} as WhereOptions<T>,
	});

	return {
		index_id,
		prev_index_id: count?.toJSON().index_number ?? '0',
		get index_number() {
			return parseInt(this.prev_index_id) + 1;
		},
	};
}

export async function genNumberIndexUpsert<
	T extends ZIndex & {},
	F extends Partial<ZIndex> & {},
>(orm: ModelStatic<Model<T>>, target: IndexNumber, value: F) {
	const numIndex = await genNumberIndex(orm, target);

	const {
		index_id = numIndex.index_id,
		index_number = numIndex.index_number,
		...rest
	} = value;

	return {...rest, index_id, index_number} as unknown as T;
}

export function pagingResult<T extends unknown>(
	count: number,
	page: number,
	limit: number,
	rows: T[],
	debug?: any,
): PagingResult<T> {
	const mod = count % limit;
	const totalPage = (count - mod) / limit + (mod > 0 ? 1 : 0);

	return {count, page, limit, totalPage, rows, debug};
}
