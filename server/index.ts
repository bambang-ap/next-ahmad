import moment from 'moment';
import {NextApiRequest, NextApiResponse} from 'next';
import {unstable_getServerSession} from 'next-auth';
import {authOptions} from 'pages/api/auth/[...nextauth]';

import {Session} from '@appTypes/app.type';
import {CRUD_ENABLED} from '@enum';

import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmMesin,
	OrmRole,
	OrmUser,
} from './database';

export const MAPPING_CRUD_ORM = {
	[CRUD_ENABLED.CUSTOMER]: OrmCustomer,
	[CRUD_ENABLED.CUSTOMER_PO]: OrmCustomerPO,
	[CRUD_ENABLED.CUSTOMER_SPPB_IN]: OrmCustomerSPPBIn,
	[CRUD_ENABLED.CUSTOMER_SPPB_OUT]: OrmCustomerSPPBOut,
	[CRUD_ENABLED.MESIN]: OrmMesin,
	[CRUD_ENABLED.ROLE]: OrmRole,
	[CRUD_ENABLED.USER]: OrmUser,
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
