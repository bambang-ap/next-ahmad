import {Op} from "sequelize";
import {z} from "zod";

import {tableFormValue, uModalType} from "@appTypes/app.zod";
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
	wherePages,
} from "@database";
import {CRUD_ENABLED, eOpKeys, TABLES, Z_CRUD_ENABLED} from "@enum";
import {generateId, pagingResult} from "@server";
import {procedure, router} from "@trpc";
import {TRPCError} from "@trpc/server";

const basicUnion = z.union([
	z.string(),
	z.number(),
	z.boolean(),
	z.array(z.any()),
]);

type BasicWherer = z.infer<typeof basicWherer>;
const basicWherer = z.record(
	basicUnion.or(z.record(eOpKeys, basicUnion)).optional(),
);

function getMappingCrud() {
	return {
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
}

export const basicWhere = basicWherer.or(z.string()).transform(obj => {
	try {
		if (typeof obj === "string") return JSON.parse(obj);
	} catch (err) {
		return undefined;
	}

	return Object.entries(obj).reduce<BasicWherer>((ret, [key, val]) => {
		if (typeof val === "object") {
			return {
				...ret,
				[key]: Object.entries(val).reduce((r, [k, v]) => {
					// @ts-ignore
					return {...r, [Op[k]]: v};
				}, {}),
			};
		}

		return {...ret, [key]: val};
	}, {});
});

const basicRouters = router({
	getPage: procedure
		.input(
			z.object({
				target: Z_CRUD_ENABLED.optional(),
				where: basicWhere.optional(),
				searchKey: z.string().or(z.string().array()).optional(),
				...tableFormValue.shape,
			}),
		)
		.query(async ({input}) => {
			const MAPPING_CRUD_ORM = getMappingCrud();
			const {target, where, limit, page, search, searchKey} = input;

			if (!target) throw new TRPCError({code: "BAD_REQUEST"});

			const limitation = {
				limit,
				order: [["id", "asc"]],
				offset: (page - 1) * limit,
				where: wherePages(searchKey, search),
			};

			// @ts-ignore
			const orm = MAPPING_CRUD_ORM[target];
			const {count, rows} = await orm.findAndCountAll(
				where ? {where} : limitation,
			);

			return pagingResult(count, page, limit, rows);
		}),
	get: procedure
		.input(
			z.object({
				target: Z_CRUD_ENABLED,
				where: basicWhere.optional(),
			}),
		)
		.query(async ({input: {target, where}}) => {
			const MAPPING_CRUD_ORM = getMappingCrud();
			// @ts-ignore
			const orm = MAPPING_CRUD_ORM[target];
			const ormResult = await orm.findAll({where, order: [["id", "asc"]]});
			return ormResult;
		}),

	mutate: procedure
		.input(
			z.object({
				target: Z_CRUD_ENABLED.optional(),
				type: uModalType,
				body: z.any(),
			}),
		)
		.mutation(async ({input}) => {
			const {body, target, type} = input;
			const {id, ...rest} = body;

			const MAPPING_CRUD_ORM = getMappingCrud();
			// @ts-ignore
			const orm = MAPPING_CRUD_ORM[target];

			switch (type) {
				case "delete":
					return orm.destroy({where: {id}});
				case "edit":
					return orm.update(rest, {where: {id}});
				default:
					const idFirst = target
						?.split("_")
						.map(e => e[0])
						.join("")
						.toUpperCase();
					return orm.create({...rest, id: generateId(idFirst)});
			}
		}),
});

export default basicRouters;
