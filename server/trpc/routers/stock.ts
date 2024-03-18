import {TDecimal, UnitQty, UQty} from '@appTypes/app.type';
import {tableFormValue, zIds} from '@appTypes/app.zod';
import {
	attrParserExclude,
	attrParserV2,
	dInItem,
	dItem,
	dOutItem,
	sumLiteral,
	wherePagesV2,
} from '@database';
import {checkCredentialV2, pagingResult} from '@server';
import {procedure, router} from '@trpc';

export default function stockRouters() {
	type A = ReturnType<typeof attributes>;

	type Ret = A['Ret'];
	type Rett = A['Rett'];

	function attributes() {
		const qtys: (keyof UnitQty)[] = ['qty1', 'qty2', 'qty3'];
		const item = attrParserExclude(dItem.unscoped(), [
			'instruksi',
			'kategori_mesinn',
			'default_mesin',
			'kategori_mesin',
			'keterangan',
			'harga',
			'unit_notes',
		]);
		const inItem = attrParserV2(dInItem, qtys, true);
		const outItem = attrParserV2(dOutItem, qtys, true);
		const inItem2 = attrParserV2(dInItem, [...qtys, 'createdAt', 'id']);
		const outItem2 = attrParserV2(dOutItem, [...qtys, 'createdAt', 'id_item']);

		type RetA = typeof item.obj & {
			dInItems: (typeof inItem.obj & {dOutItems: typeof outItem.obj})[];
		};
		type RetB = typeof item.obj &
			Record<ToString<`${UQty}`, 'inQty' | 'outQty'>, null | TDecimal>;

		return {
			qtys,
			item,
			inItem,
			outItem,
			inItem2,
			outItem2,
			Ret: {} as RetA,
			Rett: {} as RetB,
		};
	}

	return router({
		get: procedure.input(tableFormValue).query(({ctx, input}) => {
			const {limit, page, search} = input;

			const {inItem, item, outItem} = attributes();

			return checkCredentialV2(ctx, async () => {
				const {count, rows} = await item.model.findAndCountAll({
					limit,
					subQuery: false,
					group: ['dItem.id'],
					offset: (page - 1) * limit,
					include: [{...inItem, include: [outItem]}],
					where: wherePagesV2<Ret>(['name', 'kode_item'], search),
					attributes: {
						...item.attributes,
						include: [
							sumLiteral<Ret>('inQty1', 'dInItems.qty1'),
							sumLiteral<Ret>('outQty1', 'dInItems.dOutItems.qty1'),
							sumLiteral<Ret>('inQty2', 'dInItems.qty2'),
							sumLiteral<Ret>('outQty2', 'dInItems.dOutItems.qty2'),
							sumLiteral<Ret>('inQty3', 'dInItems.qty3'),
							sumLiteral<Ret>('outQty3', 'dInItems.dOutItems.qty3'),
						],
					},
				});

				return pagingResult(
					!!search ? rows.length : Math.add(0, ...count.map(e => e.count)),
					page,
					limit,
					rows as unknown as Rett[],
				);
			});
		}),
		export: procedure.input(zIds).query(({input, ctx}) => {
			const {inItem2, item, outItem2} = attributes();

			return checkCredentialV2(ctx, async () => {
				type Ret = typeof item.obj & {
					dInItems: typeof inItem2.obj & {dOutItems: typeof outItem2.obj};
				};

				const data = await item.model.findAll({
					raw: true,
					nest: true,
					where: {id: input.ids},
					attributes: item.attributes,
					include: [{...inItem2, includee: [outItem2]}],
				});

				const result = data.reduce<MyObject[]>((ret, cur, index) => {
					const val = cur as unknown as Ret;

					const i = index - 1;
					return ret;
				}, []);

				return {result, data};
			});
		}),
	});
}
