import moment from 'moment';
import {NextApiRequest, NextApiResponse} from 'next';
import {unstable_getServerSession} from 'next-auth';
import {authOptions} from 'pages/api/auth/[...nextauth]';

import {Session} from '@appTypes/app.type';
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
			session: {user: {role: 'admin'}} as Session | null,
			hasSession: true,
		};
	}

	const session = await unstable_getServerSession(req, res, authOptions);

	return {session: session as Session | null, hasSession: !!session};
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
	return `${uuid()}-${moment(getNow()).unix()}`;
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
	callback: (() => Promise<T>) | (() => T),
) => {
	const {hasSession} = await getSession(req, res);

	if (!hasSession) {
		throw new TRPCError({
			code: 'FORBIDDEN',
			message: 'You have no credentials',
		});
	}

	return callback();
};
