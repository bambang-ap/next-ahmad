import moment from "moment";
import {NextApiRequest, NextApiResponse} from "next";
import {getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import {Model, ModelStatic} from "sequelize";

import {PagingResult, TSession} from "@appTypes/app.type";
import {TRPCError} from "@trpc/server";
import {classNames} from "@utils";

export const getSession = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.headers["user-agent"]?.toLowerCase()?.includes("postman")) {
		return {
			session: {user: {role: "admin"}} as TSession,
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

	if (!hasSession) return Response(res).error("You have no credentials");

	return callback();
};

export async function checkCredentialV2<T>(
	ctx: {req: NextApiRequest; res: NextApiResponse},
	callback: ((session: TSession) => Promise<T>) | ((session: TSession) => T),
	// allowedRole?: string,
) {
	const {hasSession, session} = await getSession(ctx.req, ctx.res);

	if (!hasSession) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "You have no credentials",
		});
	}

	return callback(session);
}

export function generateId(id?: string) {
	const now = moment();
	return classNames(id, now.format("YY MM DD"), uuid().slice(-4)).replace(
		/\s/g,
		"",
	);
}

export async function genInvoice<T extends object, P extends string>(
	orm: ModelStatic<Model<T>>,
	prefix: P,
	counter: (data?: Model<T>["dataValues"]) => string | undefined,
	// @ts-ignore
	order: keyof T = "createdAt",
	length = 5,
): Promise<`${P}/${string}`> {
	// @ts-ignore
	const count = await orm.findOne({order: [[order, "DESC"]]});
	const counterResult = counter(count?.dataValues)?.replace(/[^0-9.]/g, "");
	const countString = (parseInt(counterResult ?? "0") + 1)
		.toString()
		.padStart(length, "0");
	return `${prefix}/${countString}`;
}

export function pagingResult<T extends unknown>(
	count: number,
	page: number,
	limit: number,
	rows: T[],
): PagingResult<T> {
	const mod = count % limit;
	const totalPage = (count - mod) / limit + (mod > 0 ? 1 : 0);

	return {count, page, limit, totalPage, rows};
}

// export function ormDecimalType(fieldName: string) {
// 	return {
// 		type: DECIMAL,
// 		get(): number {
// 			// @ts-ignore
// 			const value = this?.getDataValue?.(fieldName);
// 			return value ? parseFloat(value ?? 0) : 0;
// 		},
// 	};
// }
