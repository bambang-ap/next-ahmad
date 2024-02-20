import {Op} from 'sequelize';
import {z} from 'zod';

import {
	KanbanGetRow,
	PagingResult,
	RetGrade,
	TCustomer,
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TKanban,
	TKategoriMesin,
	TMasterItem,
	TMaterial,
	TMaterialKategori,
	TMesin,
	TParameter,
	TParameterKategori,
} from '@appTypes/app.type';
import {
	tableFormValue,
	TCustomerPO,
	TCustomerSPPBIn,
	TIndex,
	tKanban,
	tMasterItem,
} from '@appTypes/app.zod';
import {ItemDetail} from '@appTypes/props.type';
import {isProd} from '@constants';
import {
	dIndex,
	getMesinProcess,
	indexWhereAttributes,
	KJKD,
	orderPages,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmDocument,
	OrmKanban,
	OrmKanbanItem,
	OrmKategoriMesin,
	OrmMasterItem,
	OrmMesin,
	OrmScan,
	OrmUser,
	wherePagesV2,
} from '@database';
import {getKanbanGrade} from '@db/getGrade';
import {checkCredentialV2, pagingResult} from '@server';
import {procedure} from '@trpc';
import {appRouter} from '@trpc/routers';

import {getSppbInPages} from '../sppb/in';
import kanbanPoRouters from './po';

export type DataProcess = {
	process: TInstruksiKanban;
	hardness: (THardness & {OrmHardnessKategori: THardnessKategori})[];
	material: (TMaterial & {OrmMaterialKategori: TMaterialKategori})[];
	parameter: (TParameter & {OrmParameterKategori: TParameterKategori})[];
};

export const kanbanGet = {
	po: kanbanPoRouters,
	availableMesins: procedure.input(z.string()).query(({ctx, input}) => {
		return checkCredentialV2(ctx, async () => {
			const mesins = await OrmMesin.findAll({where: {kategori_mesin: input}});
			return mesins.map(e => e.toJSON());
		});
	}),
	nameMesin: procedure
		.input(tKanban.pick({list_mesin: true}))
		.query(({ctx, input}) => {
			type OO = TMesin & {[OrmKategoriMesin._alias]: TKategoriMesin};
			return checkCredentialV2(ctx, async () => {
				const id = new Set(
					Object.values(input.list_mesin).reduce((ret, cur) => {
						return [...ret, ...cur];
					}, [] as string[]),
				);
				const listMesin = await OrmMesin.findAll({
					where: {id: [...id.values()]},
					include: [{model: OrmKategoriMesin, as: OrmKategoriMesin._alias}],
				});
				return listMesin.map(({dataValues}) => dataValues as OO);
			});
		}),
	itemDetail: procedure
		.input(z.string().or(z.string().array()))
		.query(({ctx, input}) => {
			return checkCredentialV2(ctx, async () => {
				if (!Array.isArray(input)) {
					const listMasterItem = await OrmMasterItem.findOne({
						where: {id: input},
						include: [OrmKategoriMesin],
					});

					return parseItem(listMasterItem?.dataValues);
				}

				const listMasterItem = await OrmMasterItem.findAll({
					where: {id: input},
					include: [OrmKategoriMesin],
				});

				return Promise.all(listMasterItem.map(e => parseItem(e.dataValues)));

				async function parseItem(data?: TMasterItem) {
					const item = data as ItemDetail;
					const availableMesins = (
						await OrmMesin.findAll({
							where: {kategori_mesin: item?.OrmKategoriMesin.id},
						})
					).map(e => e.dataValues);

					return {...item, availableMesins};
				}
			});
		}),
	detail: procedure.input(z.string()).query(({ctx, input: id}) => {
		return checkCredentialV2(ctx, async (): Promise<KanbanGetRow | null> => {
			const dataKanban = await OrmKanban.findOne({
				where: {id},
				include: [
					{model: dIndex},
					{model: OrmDocument},
					{model: OrmCustomerPO, include: [OrmCustomer]},
					{model: OrmUser, as: OrmKanban._aliasCreatedBy},
					{model: OrmUser, as: OrmKanban._aliasUpdatedBy},
				],
			});

			if (!dataKanban) return null;

			return parseDetailKanban(dataKanban.dataValues);
		});
	}),
	getPage: procedure.input(tableFormValue).query(({ctx, input}) => {
		type UUU = {
			dIndex?: TIndex;
			OrmCustomerPO: TCustomerPO & {OrmCustomer: TCustomer};
			OrmCustomerSPPBIn: TCustomerSPPBIn;
		} & TKanban;

		type UOO = UUU & RetGrade;

		return checkCredentialV2(ctx, async (): Promise<PagingResult<UOO>> => {
			const {limit, page, search} = input;

			const where1 = wherePagesV2<UUU>(
				[
					'nomor_kanban',
					'$OrmCustomerPO.nomor_po$',
					'$OrmCustomerSPPBIn.nomor_surat$',
					'$OrmCustomerPO.OrmCustomer.name$',
				],
				search,
			);

			const where2 = isProd ? {} : {id: search};

			const indexAttr = indexWhereAttributes<UUU>(
				'dIndex.prefix',
				'index_number',
				search,
			);

			const {count, rows} = await OrmKanban.findAndCountAll({
				limit,
				order: orderPages<UUU>({createdAt: false, index_number: false}),
				offset: (page - 1) * limit,
				where: search ? {[Op.or]: [where1, indexAttr?.where, where2]} : {},
				attributes: {include: [indexAttr.attributes]},
				include: [
					dIndex,
					OrmCustomerSPPBIn,
					{
						model: OrmCustomerPO,
						include: [OrmCustomer],
						attributes: ['id', 'nomor_po'] as (keyof TCustomerPO)[],
					},
				],
			});

			const pageData = rows.map(async e => {
				const val = e.toJSON() as unknown as UOO;

				const scoresStatus = await getKanbanGrade({id_kanban: val.id});

				return {...val, ...scoresStatus};
			});

			return pagingResult(count, page, limit, await Promise.all(pageData));
		});
	}),
	get: procedure
		.input(
			z.object({
				type: z.literal('kanban'),
				where: tKanban.partial().optional(),
			}),
		)
		.query(({ctx: {req, res}, input: {where}}) => {
			const routerCaller = appRouter.createCaller({req, res});
			return checkCredentialV2(
				{req, res},
				async (): Promise<KanbanGetRow[]> => {
					const dataKanban = await OrmKanban.findAll({
						where,
						attributes: ['id'],
						order: [['nomor_kanban', 'asc']],
					});
					const detailedKanban = await Promise.all(
						dataKanban.map(e => routerCaller.kanban.detail(e.dataValues.id)),
					);

					return detailedKanban.filter(Boolean);
				},
			);
		}),
	mesinProcess: procedure
		.input(
			z.object({
				process: tMasterItem.shape.instruksi.optional(),
				selectedMesin: z.string().array().optional(),
				kategoriMesin: z.string().array().optional(),
			}),
		)
		.query(({ctx, input}) => {
			return checkCredentialV2(
				ctx,
				(): Promise<KJKD[]> => getMesinProcess(input),
			);
		}),
};

async function parseDetailKanban(dataValues: TKanban) {
	const {id_sppb_in, id} = dataValues;

	const dataItems = await OrmKanbanItem.findAll({
		where: {id_kanban: dataValues.id},
		include: [OrmMasterItem],
	});

	const dataScan = await OrmScan.findOne({where: {id_kanban: id}});
	const dataSppbInPages = await getSppbInPages({id: id_sppb_in});
	const dataSppbIn = dataSppbInPages?.rows;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// const {image, ...restDataValues} = dataValues;
	const {...restDataValues} = dataValues;

	const objectData: KanbanGetRow = {
		...restDataValues,
		dataScan: dataScan?.dataValues,
		// @ts-ignore
		dataSppbIn: dataSppbIn.find(e => e.id === id_sppb_in)!,
		get id_customer() {
			return this.OrmCustomerPO?.id_customer;
		},
		get items() {
			return dataItems.reduce((ret, e) => {
				// @ts-ignore
				ret[e.dataValues.id_item] = {
					...e.dataValues,
					id_sppb_in: this.dataSppbIn?.id,
				};
				return ret;
			}, {} as KanbanGetRow['items']);
		},
	};

	return objectData;
}
