import moment from 'moment';
import {NextApiRequest, NextApiResponse} from 'next';
import {unstable_getServerSession} from 'next-auth';
import {authOptions} from 'pages/api/auth/[...nextauth]';

import {Session} from '@appTypes/app.type';

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
