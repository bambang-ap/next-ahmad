import {Op} from "sequelize";
import {z} from "zod";

import {tableFormValue, uModalType} from "@appTypes/app.zod";
import {wherePages} from "@database";
import {eOpKeys, Z_CRUD_ENABLED} from "@enum";
import {generateId, MAPPING_CRUD_ORM, pagingResult} from "@server";
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

export const basicWhere = basicWherer.transform(obj => {
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

			// @ts-ignore
			const orm = MAPPING_CRUD_ORM[target];

			switch (type) {
				case "delete":
					return orm.destroy({where: {id}});
				case "edit":
					return orm.update(rest, {where: {id}});
				default:
					return orm.create({...rest, id: generateId()});
			}
		}),
});

export default basicRouters;
