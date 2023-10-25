import {Path} from 'react-hook-form';
import {col, Op, WhereAttributeHashValue} from 'sequelize';
import {Primitive} from 'zod';

export function groupPages<T extends {}>(
	searchKey: Path<ObjectNonArray<T>>,
): any {
	return searchKey;
}

export function orderPages<T extends {}>(
	searchKey: Partial<Record<Path<ObjectNonArray<T>>, boolean>>,
): any {
	return entries(searchKey).map(([key, value]) => {
		return [col(key), value ? 'asc' : 'desc'];
	});
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
	searchKey: O<T>,
	operator: keyof typeof Op = 'and',
): any {
	return {
		[Op[operator]]: Object.entries(searchKey).map(keys => {
			const [key, value] = keys;
			return {[key]: value};
		}),
	};
}

type U<T extends {}> = ['or' | 'and', O<T>];
type O<T extends {}> = Partial<
	Record<
		Path<ObjectNonArray<T>> | `$${Path<ObjectNonArray<T>>}$`,
		Primitive | WhereAttributeHashValue<any>
	>
>;

export function wherePagesV4<T extends {}>(
	...searchKeys: (U<T> | O<T>)[]
): any {
	return searchKeys.reduce((ret, asd) => {
		const isArray = Array.isArray(asd);
		const [op, searchKey]: U<T> = isArray ? asd : ['and', asd];

		return {
			...ret,
			[Op[op]]: Object.entries(searchKey).map(([key, value]) => {
				return {[key]: value};
			}),
		};
	}, {});
}
