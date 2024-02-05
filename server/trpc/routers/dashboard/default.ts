import {TScanTarget} from '@appTypes/app.type';
import {TDashboard, TDashboardInput, tDateFilter} from '@appTypes/app.zod';
import {
	dCust,
	dKanban,
	dMesin,
	dPo,
	dScan,
	dSJIn,
	dSjOut,
	dVehicle,
	OrmHardness,
	OrmKanbanInstruksi,
	OrmMaterial,
	OrmParameter,
	whereDateFilter,
} from '@database';
import {MenuColor, PATHS} from '@enum';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';
import {twColors} from '@utils';

export const defaultDashboardRouter = {
	totalCount: procedure.input(tDateFilter.partial()).query(({input, ctx}) =>
		checkCredentialV2(ctx, async (): Promise<TDashboard[]> => {
			const data: TDashboardInput[] = [
				{
					title: 'Mesin',
					path: PATHS.app_mesin,
					image: '/public/assets/dashboard/mesin.png',
					bgColor: MenuColor.Mesin,
					count: dMesin.count({where: whereDateFilter('$createdAt$', input)}),
				},
				{
					title: 'Customer',
					bgColor: MenuColor.Cust,
					path: PATHS.app_customer,
					image: '/public/assets/dashboard/customer.png',
					count: dCust.count({where: whereDateFilter('$createdAt$', input)}),
				},
				{
					title: 'PO',
					path: PATHS.app_customer_po,
					image: '/public/assets/dashboard/po.png',
					bgColor: MenuColor.PO,
					count: dPo.count({where: whereDateFilter('$tgl_po$', input)}),
				},
				{
					title: 'Kendaraan',
					bgColor: MenuColor.Vehicle,
					path: PATHS.app_kendaraan,
					image: '/public/assets/dashboard/kendaraan.png',
					count: dVehicle.count({where: whereDateFilter('$createdAt$', input)}),
				},
				{
					title: 'SPPB In',
					path: PATHS.app_customer_customer_sppb_in,
					image: '/public/assets/dashboard/sppb-in.png',
					bgColor: MenuColor.SJIn,
					count: dSJIn.count({where: whereDateFilter('$tgl$', input)}),
				},
				{
					title: 'SPPB Out',
					path: PATHS.app_customer_customer_sppb_out,
					image: '/public/assets/dashboard/sppb-out.png',
					bgColor: MenuColor.SJOut,
					count: dSjOut.count({where: whereDateFilter('$date$', input)}),
				},
				{
					title: 'Kanban',
					path: PATHS.app_kanban,
					image: '/public/assets/dashboard/kanban.png',
					bgColor: MenuColor.Kanban,
					count: dKanban.count({where: whereDateFilter('$createdAt$', input)}),
				},
				{
					title: 'Proses Kanban',
					path: PATHS.app_kanban_instruksi,
					image: '/public/assets/dashboard/proses.png',
					count: OrmKanbanInstruksi.count({
						where: whereDateFilter('$createdAt$', input),
					}),
				},
				{
					title: 'Parameter',
					path: PATHS.app_parameter,
					image: '/public/assets/dashboard/parameter.png',
					count: OrmParameter.count({
						where: whereDateFilter('$createdAt$', input),
					}),
				},
				{
					title: 'Material',
					path: PATHS.app_hardness,
					image: '/public/assets/dashboard/material.png',
					bgColor: MenuColor.Material,
					count: OrmMaterial.count({
						where: whereDateFilter('$createdAt$', input),
					}),
				},
				{
					title: 'Hardness',
					path: PATHS.app_hardness,
					image: '/public/assets/dashboard/material.png',
					count: OrmHardness.count({
						where: whereDateFilter('$createdAt$', input),
					}),
				},
				{
					title: 'Scan Produksi',
					bgColor: MenuColor.Prod,
					image: '/public/assets/dashboard/kanban.png',
					path: PATHS.app_scan_produksi_list,
					count: dScan.count({
						where: {
							status: 'produksi' as TScanTarget,
							...whereDateFilter('$createdAt$', input),
						},
					}),
				},
				{
					bgColor: MenuColor.QC,
					title: 'Scan QC',
					image: '/public/assets/dashboard/kanban.png',
					path: PATHS.app_scan_qc_list,
					count: dScan.count({
						where: {
							status: 'qc' as TScanTarget,
							...whereDateFilter('$createdAt$', input),
						},
					}),
				},
				{
					bgColor: MenuColor.FG,
					title: 'Scan Finish Good',
					image: '/public/assets/dashboard/kanban.png',
					path: PATHS.app_scan_finish_good_list,
					count: dScan.count({
						where: {
							status: 'finish_good' as TScanTarget,
							...whereDateFilter('$createdAt$', input),
						},
					}),
				},
			];

			return Promise.all(
				data.map<Promise<TDashboard>>(
					async ({image, count, bgColor: color, ...item}) => {
						return {
							...item,
							count: await count,
							bgColor: color ?? twColors.green[600],
							image: image?.replace('/public', ''),
						};
					},
				),
			);
		}),
	),
};
