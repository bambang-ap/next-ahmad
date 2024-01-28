import {
	col,
	DECIMAL,
	FindAttributeOptions,
	fn,
	literal,
	Model,
	ModelStatic,
	Order,
	Sequelize,
	STRING,
} from 'sequelize';
import {noUnrecognized, objectKeyMask, z, ZodObject, ZodRawShape} from 'zod';

import {Context, TDecimal, TItemUnit, TMasterItem} from '@appTypes/app.type';
import {
	defaultExcludeColumn,
	defaultExcludeColumns,
	defaultOrderBy,
} from '@constants';
import {appRouter} from '@trpc/routers';

import {L1, literalFieldType} from './where';

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

	const litDiscQuery = `
case
	when ${typeCol} is not null
		then case
			when ${typeCol} = '%' then COALESCE(${qtyCol}, 0) * COALESCE(${hargaCol}, 0) * 0.01
			when ${typeCol} = '1' then COALESCE(${qtyCol}, 0) * COALESCE(${hargaCol}, 0) - COALESCE(${discCol}, 0)
		else 0 end
	else 0
end`;

	const litDisc = litDiscQuery.replace(/\s+/g, ' ').replace(/\n/g, '');

	type Ret = {
		unit: TItemUnit;
		qty: TDecimal;
		total: TDecimal;
		disc_val: TDecimal;
		total_after: TDecimal;
	};

	return {
		Ret: {} as Ret,
		group: [unitCol],
		logging: debug,
		attributes: [
			[unit, 'unit'],
			[fn('sum', col('qty3')), 'qty'],
			[fn('sum', literal(litTotal)), 'total'],
			[fn('sum', literal(litDisc)), 'disc_val'],
			[fn('sum', literal(`${litTotal} - ${litDisc}`)), 'total_after'],
		] as FindAttributeOptions,
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
) {
	type ObjType = Pick<T, K>;

	function _modify<_K extends keyof T>(attrs?: _K[]) {
		return attrParserV2(model, attrs);
	}

	return {model, obj: {} as ObjType, attributes, _modify};
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

export async function processMapper(
	ctx: Context,
	item?: Partial<Pick<TMasterItem, 'instruksi' | 'kategori_mesinn'>>,
) {
	const {instruksi: process, kategori_mesinn} = item ?? {};
	const routerCaller = appRouter.createCaller(ctx);
	const processes = await routerCaller.kanban.mesinProcess({
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
