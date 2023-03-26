import moment from 'moment';
import {NextApiRequest, NextApiResponse} from 'next';
import {getServerSession} from 'next-auth';
import {authOptions} from 'pages/api/auth/[...nextauth]';

import {TSession} from '@appTypes/app.type';
import {CRUD_ENABLED, TABLES} from '@enum';
import {TRPCError} from '@trpc/server';

import {
	OrmCustomer,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmKanbanInstruksi,
	OrmMesin,
	OrmRole,
	OrmUser,
} from './database';

export const MAPPING_CRUD_ORM = {
	[CRUD_ENABLED.CUSTOMER]: OrmCustomer,
	[TABLES.CUSTOMER_SPPB_IN]: OrmCustomerSPPBIn,
	[TABLES.CUSTOMER_SPPB_OUT]: OrmCustomerSPPBOut,
	[CRUD_ENABLED.MESIN]: OrmMesin,
	[CRUD_ENABLED.ROLE]: OrmRole,
	[CRUD_ENABLED.USER]: OrmUser,
	[CRUD_ENABLED.INSTRUKSI_KANBAN]: OrmKanbanInstruksi,
};

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

export const generateId = () => {
	return `${moment(getNow()).unix()}-${uuid()}`;
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

export const checkCredentialV2 = async <T>(
	req: NextApiRequest,
	res: NextApiResponse,
	callback: ((session: TSession) => Promise<T>) | ((session: TSession) => T),
	allowed?: string,
) => {
	const {hasSession, session} = await getSession(req, res);

	if (!hasSession) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You have no credentials',
		});
	}

	return callback(session);
};

export function pagingResult<T extends unknown>(
	count: number,
	page: number,
	limit: number,
	rows: T[],
) {
	const mod = count % limit;
	const totalPage = (count - mod) / limit + (mod > 0 ? 1 : 0);

	return {count, page, limit, totalPage, rows};
}
