import {Path} from 'react-hook-form';
import {
	col,
	fn,
	Op,
	ProjectionAlias,
	where,
	WhereAttributeHashValue,
} from 'sequelize';
import {Primitive} from 'zod';

import {indexAlias, TDateFilter} from '@appTypes/app.zod';
import {formatAll, regPrefix} from '@constants';
import {moment} from '@utils';

export function groupPages<T extends {}>(searchKey: L1<T>): any {
	return searchKey;
}

/**
 * @param True ASCENDING
 * @param False DESCENDING
 */
export function orderPages<T extends {}>(
	searchKey: Partial<Record<L1<T>, boolean>>,
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
	searchKey: (L<T> | false)[],
	search?: string | WhereAttributeHashValue<any>,
	like = true,
): any {
	if (!search) return undefined;

	return {
		[Op.or]: searchKey.map(key => {
			if (!key) return {};
			return {[key]: !like ? search : {[Op.iLike]: `%${search}%`}};
		}),
	};
}

export function wherePagesV3<T extends {}>(
	searchKey: O<T>,
	operator: keyof typeof Op = 'and',
): any {
	return {
		[Op[operator]]: Object.entries(searchKey)
			.map(keys => {
				const [key, value] = keys;
				if (Array.isArray(value) && value[0] === true)
					return !!value[1] ? {[key]: value[1]} : undefined;
				return {[key]: value};
			})
			.filter(Boolean),
	};
}

type K = Primitive | WhereAttributeHashValue<any>;
type L1<T extends {}> = Path<ObjectNonArray<T>>;
type L2<T extends {}> = `$${Path<ObjectNonArray<T>>}$`;
type L<T extends {}> = L1<T> | L2<T>;
type U<T extends {}> = ['or' | 'and', O<T>];
type O<T extends {}> = Partial<Record<L<T>, K | [filter: true, value: K]>>;

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

export function whereDateFilter<T extends {}>(
	field: LiteralUnion<L<T>>,
	{filterFrom, filterTo}: Partial<TDateFilter>,
): any {
	const from = moment(filterFrom).startOf('date').format(formatAll);
	const to = moment(filterTo).endOf('date').format(formatAll);

	return {
		[field as string]: {
			[Op.and]: [{[Op.gte]: from}, {[Op.lte]: to}],
		},
	};
}

export function indexWhereAttributes<T extends {}>(
	prefixCol: L1<T>,
	indexCol: L1<T>,
	search?: string,
) {
	const attribute = fn(
		'REGEXP_REPLACE',
		col(prefixCol),
		regPrefix,
		col(indexCol),
	);

	const whereQuery = !!search
		? where(col(indexCol), Op.iLike, `%${search}%`)
		: undefined;

	// FIXME: replace here with bottom
	// const whereQuery = !!search
	// 	? where(attribute, Op.iLike, `%${search}%`)
	// 	: undefined;

	return {
		attributes: [attribute, indexAlias] as ProjectionAlias,
		where: whereQuery,
	};
}
