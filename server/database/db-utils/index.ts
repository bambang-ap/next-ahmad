import {
	col,
	DECIMAL,
	FindAttributeOptions,
	fn,
	literal,
	Model,
	ModelStatic,
	Op,
	Order,
	Sequelize,
	STRING,
} from 'sequelize';
import {noUnrecognized, objectKeyMask, z, ZodObject, ZodRawShape} from 'zod';

import {
	RouterInput,
	TKategoriMesin,
	TMasterItem,
	TMesin,
} from '@appTypes/app.type';
import {
	defaultExcludeColumn,
	defaultExcludeColumns,
	defaultOrderBy,
} from '@constants';
import {
	OrmHardness,
	OrmHardnessKategori,
	OrmKanbanInstruksi,
	OrmKategoriMesin,
	OrmMaterial,
	OrmMaterialKategori,
	OrmMesin,
	OrmParameter,
	OrmParameterKategori,
} from '@database';
import type {DataProcess} from '@trpc/routers/kanban/get';

import {L1, literalFieldType, wherePagesV4} from './where';

export * from './attributes';
export * from './getPoScore';
export * from './getPoStatus';
export * from './relation';
export * from './where';

export const tableWithDiscount = {
	discount_type: STRING,
	discount: ormDecimalType('discount', 0),
};

export function selectorDashboardSales<T extends {}>(
	{
		unit,
		qty,
		harga,
		type,
		disc,
	}: Record<'unit' | 'qty' | 'harga' | 'type' | 'disc', LiteralUnion<L1<T>>>,
	where: any,
	debug = false,
) {
	const [unitCol, qtyCol, hargaCol, discCol, typeCol] = [
		literalFieldType(unit),
		literalFieldType(qty),
		literalFieldType(harga),
		literalFieldType(disc),
		literalFieldType(type),
	];

	const litTotal = `COALESCE(${hargaCol}, 0) * COALESCE(${qtyCol}, 0)`;
	const litDisc = `COALESCE(${discCol}, 0)`;

	const litDiscQuery = `
case
	when ${typeCol} is not null
		then case
			when ${typeCol} = '%' then ${litTotal} * ${litDisc} * 0.01
			when ${typeCol} = '1' then ${litDisc}
		else 0 end
	else 0
end`
		.replace(/\s+/g, ' ')
		.replace(/\n/g, '');

	return {
		group: [unitCol],
		logging: debug,
		attributes: [
			[col(unit), 'unit'],
			[fn('sum', literal(qtyCol)), 'qty'],
			[fn('sum', literal(litTotal)), 'total'],
			[fn('sum', literal(litDiscQuery)), 'disc_val'],
			[fn('sum', literal(`${litTotal} - ${litDiscQuery}`)), 'total_after'],
		] as FindAttributeOptions,
		where: {
			...wherePagesV4({
				[`$${unit}$`]: {[Op.eq]: 'kg'},
				[`$${qty}$`]: {[Op.not]: 'NaN'},
				[`$${harga}$`]: {[Op.not]: 'NaN'},
			}),
			...where,
		},
	};
}

export function attrParser<
	T extends ZodRawShape,
	K extends ObjKeyof<T>,
	Mask extends noUnrecognized<objectKeyMask<T>, T>,
>(schema: ZodObject<T>, attributes?: K[]) {
	let obj = schema;
	if (attributes) {
		const reducer = attributes.reduce(
			(a, b) => ({...a, [b]: true}),
			{} as Mask,
		);
		obj = schema.pick(reducer);
	}

	function _modify<_K extends ObjKeyof<T>>(attrs?: _K[]) {
		return attrParser(schema, attrs);
	}

	// @ts-ignore
	type ObjType = Pick<z.infer<typeof obj>, K>;
	return {obj: {} as ObjType, keys: attributes as K[], _modify};
}

export function attrParserZod<
	T extends ZodRawShape,
	K extends ObjKeyof<T>,
	Mask extends noUnrecognized<objectKeyMask<T>, T>,
>(schema: ZodObject<T>, model: ModelStatic<Model<any>>, attributes?: K[]) {
	let obj = schema;
	if (attributes) {
		const reducer = attributes.reduce(
			(a, b) => ({...a, [b]: true}),
			{} as Mask,
		);
		obj = schema.pick(reducer);
	}
	// @ts-ignore
	type ObjType = Pick<z.infer<typeof obj>, K>;
	return {
		model,
		zod: schema,
		obj: {} as ObjType,
		attributes: attributes as K[],
	};
}

export function attrParserV2<T extends {}, K extends keyof T>(
	model: ModelStatic<Model<T>>,
	attributes?: K[],
	emptyAttributes = false,
) {
	type ObjType = Pick<T, K>;

	function _modify<_K extends keyof T>(attrs?: _K[]) {
		return attrParserV2(model, attrs, emptyAttributes);
	}

	return {
		model,
		_modify,
		obj: {} as ObjType,
		attributes: emptyAttributes ? [] : attributes,
	};
}

export function attrParserExclude<T extends {}, K extends keyof T>(
	model: ModelStatic<Model<T>>,
	attributes?: K[],
	excludeDefault = true,
) {
	type Keys = Exclude<keyof T, K>;
	type ObjType = Pick<T, Keys>;

	function _modify<_K extends keyof T>(attrs?: _K[]) {
		return attrParserExclude(model, attrs, excludeDefault);
	}

	return {
		model,
		_modify,
		obj: {} as ObjType,
		attributes: (!!attributes
			? {
					exclude: excludeDefault
						? [...defaultExcludeColumns, ...attributes]
						: attributes,
			  }
			: excludeDefault
			? {exclude: defaultExcludeColumns}
			: undefined) as FindAttributeOptions,
	};
}

export function defaultScope(sequelize: Sequelize, withOrder = true) {
	return {
		sequelize,
		defaultScope: {
			...(withOrder ? defaultOrderBy : {}),
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	} as const;
}

export function ormDecimalType(fieldName: string, defaultValue?: any) {
	return {
		defaultValue,
		type: DECIMAL,
		get(): number {
			// @ts-ignore
			const value = this?.getDataValue?.(fieldName);
			return value ? parseFloat(value ?? 0) : 0;
		},
	};
}

export type KJKD = {
	dataProcess: DataProcess[];
	mesin?: TMesin & {OrmKategoriMesin: TKategoriMesin};
};

export async function getMesinProcess(
	input: RouterInput['kanban']['mesinProcess'],
): Promise<KJKD[]> {
	const {process, selectedMesin, kategoriMesin} = input;

	if (!!kategoriMesin) {
		const dataProcess = await OrmKategoriMesin.findAll({
			where: {id: kategoriMesin},
		});
		const dd = dataProcess.map(async ({dataValues}) => {
			const k = await kjsdfjh(dataValues.id);
			return {dataProcess: k};
		});

		return Promise.all(dd);
	}

	const listMesin = await OrmMesin.findAll({
		where: {id: selectedMesin},
		include: [{model: OrmKategoriMesin, as: OrmKategoriMesin._alias}],
	});

	const jhsdf = listMesin?.map(async mesin => {
		const dataProcess = await kjsdfjh(mesin.dataValues.kategori_mesin);
		return {
			dataProcess,
			mesin: mesin.dataValues as KJKD['mesin'],
		};
	});

	return Promise.all(jhsdf);

	async function kjsdfjh(kategori: string) {
		const pr = process?.[kategori];

		const result = pr?.map(async p => {
			const {hardness, id_instruksi, material, parameter} = p;

			const prcs = await OrmKanbanInstruksi.findOne({
				where: {id: id_instruksi},
			});

			const hdns = await OrmHardness.findAll({
				where: {id: hardness},
				include: [OrmHardnessKategori],
			});
			const mtrl = await OrmMaterial.findAll({
				where: {id: material},
				include: [OrmMaterialKategori],
			});
			const prmtr = await OrmParameter.findAll({
				where: {id: parameter},
				include: [OrmParameterKategori],
			});

			return {
				process: prcs,
				hardness: hdns,
				material: mtrl,
				parameter: prmtr,
			};
		});

		// @ts-ignore
		return (await Promise.all(result)) as DataProcess[];
	}
}

export async function processMapper(
	item?: Partial<Pick<TMasterItem, 'instruksi' | 'kategori_mesinn'>>,
) {
	const {instruksi: process, kategori_mesinn} = item ?? {};
	const processes = await getMesinProcess({
		process,
		kategoriMesin: kategori_mesinn,
	});

	const instruksi = processes
		.map(e => e.dataProcess.map(r => r.process?.name).join(' | '))
		.join(' - ');

	return instruksi;
}

export function OrmScanOrder(): Order {
	return [['updatedAt', 'DESC NULLS LAST']];
}

export function NumberOrderAttribute<T extends {}>(
	order: LiteralUnion<ObjKeyof<T>>,
) {
	return [literal(`ROW_NUMBER() OVER (ORDER BY ${order})`), 'number'] as const;
}
