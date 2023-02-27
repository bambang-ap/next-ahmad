import {
	DataType,
	DataTypes,
	FindAttributeOptions,
	Model,
	ModelAttributeColumnOptions,
	ModelAttributes,
} from 'sequelize';
import {z} from 'zod';

import {defaultExcludeColumn, ORM} from '../_init';

const workerMap = {
	ZodObject: parseObject,
	ZodString: parseType,
	ZodNumber: parseType,
	ZodBoolean: parseType,
	ZodOptional: parseOptional,
	ZodNullable: parseOptional,
};

type WorkerKeys = keyof typeof workerMap;

function parseType(
	zodRef: z.ZodTypeAny,
	allowNull?: boolean,
): ModelAttributeColumnOptions<Model<{}>> {
	const {typeName} = zodRef._def;
	const typeMapper: Record<string, DataType> = {
		ZodBoolean: DataTypes.BOOLEAN,
		ZodNumber: DataTypes.NUMBER,
		ZodString: DataTypes.STRING,
	};
	return {
		type: typeMapper[typeName] ?? DataTypes.STRING,
		allowNull: allowNull !== undefined ? allowNull : false,
	};
}

function parseObject(
	zodRef: z.AnyZodObject,
	isNullable?: boolean,
): Record<string, z.ZodTypeAny> {
	return Object.keys(zodRef.shape).reduce(
		(carry, key) => ({
			...carry,
			[key]: parseZod<z.ZodTypeAny>(zodRef.shape[key], isNullable),
		}),
		{} as Record<string, z.ZodTypeAny>,
	);
}

function parseOptional(
	zodRef: z.ZodOptional<z.ZodTypeAny> | z.ZodNullable<z.ZodTypeAny>,
	isNullable?: boolean,
) {
	return parseZod<z.ZodTypeAny>(
		zodRef.unwrap(),
		isNullable !== undefined ? isNullable : true,
	);
}

export function parseZod<T extends z.ZodTypeAny>(
	zodRef: T,
	isNullable?: boolean,
): z.infer<typeof zodRef> {
	const typeName = zodRef._def.typeName as WorkerKeys;
	if (typeName in workerMap) {
		return workerMap[typeName](zodRef as never, isNullable);
	}

	return undefined;
}

export function generateAttributes<T extends z.ZodTypeAny>(
	name: string,
	zodRef: T,
	primaryKey?: keyof z.infer<T>,
	defaultScopeAttributes?: FindAttributeOptions,
) {
	const attributes = parseZod(zodRef) as ModelAttributes<any, z.infer<T>>;

	// @ts-ignore
	if (primaryKey) attributes[primaryKey].primaryKey = true;

	return ORM.define(name, attributes, {
		tableName: name,
		defaultScope: {
			attributes: {
				exclude: defaultExcludeColumn,
				...defaultScopeAttributes,
			},
		},
	});
}
