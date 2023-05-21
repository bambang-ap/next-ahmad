import moment from "moment";
import {NextApiRequest, NextApiResponse} from "next";
import {getServerSession} from "next-auth";
import {authOptions} from "pages/api/auth/[...nextauth]";
import {Model, ModelStatic} from "sequelize";

import {PagingResult, TSession} from "@appTypes/app.type";
import {CRUD_ENABLED, TABLES} from "@enum";
import {TRPCError} from "@trpc/server";
import {classNames} from "@utils";

import {
	OrmCustomer,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmDocument,
	OrmHardness,
	OrmHardnessKategori,
	OrmKanbanInstruksi,
	OrmKategoriMesin,
	OrmKendaraan,
	OrmMasterItem,
	OrmMaterial,
	OrmMaterialKategori,
	OrmMesin,
	OrmParameter,
	OrmParameterKategori,
	OrmRole,
	OrmUser,
} from "./database";

export const MAPPING_CRUD_ORM = {
	[CRUD_ENABLED.CUSTOMER]: OrmCustomer,
	[TABLES.CUSTOMER_SPPB_IN]: OrmCustomerSPPBIn,
	[TABLES.CUSTOMER_SPPB_OUT]: OrmCustomerSPPBOut,
	[CRUD_ENABLED.MESIN]: OrmMesin,
	[CRUD_ENABLED.MESIN_KATEGORI]: OrmKategoriMesin,
	[CRUD_ENABLED.KENDARAAN]: OrmKendaraan,
	[CRUD_ENABLED.ROLE]: OrmRole,
	[CRUD_ENABLED.USER]: OrmUser,
	[CRUD_ENABLED.INSTRUKSI_KANBAN]: OrmKanbanInstruksi,
	[CRUD_ENABLED.MATERIAL]: OrmMaterial,
	[CRUD_ENABLED.MATERIAL_KATEGORI]: OrmMaterialKategori,
	[CRUD_ENABLED.HARDNESS]: OrmHardness,
	[CRUD_ENABLED.HARDNESS_KATEGORI]: OrmHardnessKategori,
	[CRUD_ENABLED.PARAMETER]: OrmParameter,
	[CRUD_ENABLED.PARAMETER_KATEGORI]: OrmParameterKategori,
	[CRUD_ENABLED.DOCUMENT]: OrmDocument,
	[CRUD_ENABLED.ITEM]: OrmMasterItem,
};

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

export function generateId() {
	const now = moment();
	return classNames(now.format("YY MM DD"), uuid().slice(-4)).replace(
		/\s/g,
		"",
	);
}

export async function genInvoice<
	T extends ModelStatic<Model>,
	P extends string,
>(orm: T, prefix: P, length = 5): Promise<`${P}/${string}`> {
	const count = await orm.count();
	const countString = (count + 1).toString().padStart(length, "0");
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
