import {Op} from 'sequelize';
import {z} from 'zod';

import {
	AppRouterCaller,
	KanbanGetRow,
	PagingResult,
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
	indexWhereAttributes,
	orderPages,
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmDocument,
	OrmHardness,
	OrmHardnessKategori,
	OrmKanban,
	OrmKanbanInstruksi,
	OrmKanbanItem,
	OrmKategoriMesin,
	OrmMasterItem,
	OrmMaterial,
	OrmMaterialKategori,
	OrmMesin,
	OrmParameter,
	OrmParameterKategori,
	OrmScan,
	OrmUser,
	wherePagesV2,
} from '@database';
import {checkCredentialV2, pagingResult} from '@server';
import {procedure} from '@trpc';
import {appRouter} from '@trpc/routers';

import kanbanPoRouters from './po';

type KJKD = {
	dataProcess: DataProcess[];
	mesin?: TMesin & {OrmKategoriMesin: TKategoriMesin};
};

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
		const routerCaller = appRouter.createCaller(ctx);

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

			return parseDetailKanban(dataKanban.dataValues, routerCaller);
		});
	}),
	getPage: procedure.input(tableFormValue).query(({ctx, input}) => {
		type UUU = TKanban & {
			dIndex?: TIndex;
			OrmCustomerPO: TCustomerPO & {OrmCustomer: TCustomer};
			OrmCustomerSPPBIn: TCustomerSPPBIn;
		};
		return checkCredentialV2(ctx, async (): Promise<PagingResult<UUU>> => {
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

			return pagingResult(
				count,
				page,
				limit,
				rows.map(e => e.dataValues as UUU),
			);
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
		.query(({ctx, input: {process, selectedMesin, kategoriMesin}}) => {
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
			return checkCredentialV2(ctx, async (): Promise<KJKD[]> => {
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
			});
		}),
};

async function parseDetailKanban(
	dataValues: TKanban,
	routerCaller: AppRouterCaller,
) {
	const {id_sppb_in, id} = dataValues;

	const dataItems = await OrmKanbanItem.findAll({
		where: {id_kanban: dataValues.id},
		include: [OrmMasterItem],
	});
	const dataSppbIn = await routerCaller.sppb.in.get({
		type: 'sppb_in',
		where: {id: id_sppb_in},
	});
	const dataScan = await OrmScan.findOne({where: {id_kanban: id}});

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	// const {image, ...restDataValues} = dataValues;
	const {...restDataValues} = dataValues;

	const objectData: KanbanGetRow = {
		...restDataValues,
		dataScan: dataScan?.dataValues,
		dataSppbIn: dataSppbIn.find(e => e.id === id_sppb_in),
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
