import {z, ZodArray, ZodObject, ZodRawShape} from 'zod';

function safeKeys<Lookup extends {[k in string]: unknown}>(lookup: Lookup) {
	return Object.keys(lookup) as (keyof Lookup)[];
}

function mapFrom<Map extends object>(
	keys: readonly (keyof Map)[],
	mapFn: <Key extends keyof Map>(key: Key) => Map[Key],
) {
	return Object.fromEntries(keys.map(key => [key, mapFn(key)])) as {
		[K in keyof Map]: Map[K];
	};
}

export default function toArraySchema<Shape extends ZodRawShape>(
	schema: ZodObject<Shape>,
) {
	const shape: Shape = schema.shape;
	return mapFrom<{[K in keyof Shape]: ZodArray<Shape[K]>}>(
		safeKeys(shape),
		key => z.array(shape[key]),
	);
}
