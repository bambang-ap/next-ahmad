type NestedKeyOf<ObjectType extends object, Delimiter extends string = '-'> = {
	[Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
		? never | `${Key}${Delimiter}${NestedKeyOf<ObjectType[Key]>}`
		: `${Key}`;
}[keyof ObjectType & (string | number)];

type LiteralUnion<T extends U, U = string> = T | (U & {property?: never});

type TNextApi = (req: NextApiRequest, res: NextApiResponse) => void;
