import {Path} from 'react-hook-form';
import {
	DECIMAL,
	FindAttributeOptions,
	literal,
	Model,
	ModelStatic,
	Op,
	Order,
	Sequelize,
	WhereAttributeHashValue,
} from 'sequelize';
import {
	noUnrecognized,
	objectKeyMask,
	Primitive,
	z,
	ZodObject,
	ZodRawShape,
} from 'zod';

import {Context, TMasterItem} from '@appTypes/app.type';
import {
	defaultExcludeColumn,
	defaultExcludeColumns,
	defaultOrderBy,
} from '@constants';
import {appRouter} from '@trpc/routers';

export * from './attributes';
export * from './getPoStatus';
export * from './relation';

export function attrParser<
	T extends ZodRawShape,
	K extends ObjKeyof<T>,
	Mask extends noUnrecognized<objectKeyMask<T>, T>,
>(schema: ZodObject<T>, attributes?: K[]) {
	// TODO: Add omit options
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
	return {obj: {} as ObjType, keys: attributes as K[]};
}

export function attrParserV2<T extends {}, K extends keyof T>(
	model: ModelStatic<Model<T>>,
	attributes?: K[],
) {
	type ObjType = Pick<T, K>;
	// TODO: orm->model keys->attributes (spread op can be done)
	return {model, obj: {} as ObjType, attributes};
}
export function attrParserExclude<T extends {}, K extends keyof T>(
	model: ModelStatic<Model<T>>,
	attributes?: K[],
	excludeDefault = true,
) {
	type Keys = Exclude<keyof T, K>;
	type ObjType = Pick<T, Keys>;
	return {
		model,
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

export function defaultScope(sequelize: Sequelize) {
	return {
		sequelize,
		defaultScope: {
			...defaultOrderBy,
			attributes: {
				exclude: defaultExcludeColumn,
			},
		},
	} as const;
}

export function ormDecimalType(fieldName: string) {
	return {
		type: DECIMAL,
		get(): number {
			// @ts-ignore
			const value = this?.getDataValue?.(fieldName);
			return value ? parseFloat(value ?? 0) : 0;
		},
	};
}

export function wherePages(
	searchKey?: string | string[],
	search?: string,
): any {
	if (!searchKey || !search) return undefined;

	if (!Array.isArray(searchKey)) {
		return {
			[searchKey]: {
				[Op.iLike]: `%${search}%`,
			},
		};
	}

	return {
		[Op.or]: searchKey.map(key => {
			return {
				[key]: {
					[Op.iLike]: `%${search}%`,
				},
			};
		}),
	};
}

export function wherePagesV2<T extends {}>(
	searchKey: (Path<ObjectNonArray<T>> | `$${Path<ObjectNonArray<T>>}$`)[],
	search?: string | WhereAttributeHashValue<any>,
	like = true,
): any {
	if (!search) return undefined;

	return {
		[Op.or]: searchKey.map(key => {
			return {[key]: !like ? search : {[Op.iLike]: `%${search}%`}};
		}),
	};
}

export function wherePagesV3<T extends {}>(
	searchKey: Partial<
		Record<
			Path<ObjectNonArray<T>> | `$${Path<ObjectNonArray<T>>}$`,
			Primitive | WhereAttributeHashValue<any>
		>
	>,
): any {
	return {
		[Op.and]: Object.entries(searchKey).map(keys => {
			const [key, value] = keys;
			return {[key]: value};
		}),
	};
}

export function orderPages<T extends {}>(
	searchKey: Path<ObjectNonArray<T>>,
): any {
	return searchKey;
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
		.map(e => e.dataProcess.map(r => r.process.name).join(' | '))
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
