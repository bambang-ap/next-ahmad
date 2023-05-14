import {TDashboard, TDashboardInput} from "@appTypes/app.zod";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmHardness,
	OrmKanban,
	OrmKanbanInstruksi,
	OrmKendaraan,
	OrmMaterial,
	OrmMesin,
	OrmParameter,
	OrmScan,
} from "@database";
import {checkCredentialV2} from "@server";
import {procedure} from "@trpc";

export const dashboardRouter = procedure.query(({ctx}) =>
	checkCredentialV2(ctx, async (): Promise<TDashboard[]> => {
		const data: TDashboardInput[] = [
			{
				title: "Mesin",
				path: "/app/mesin",
				image: "/public/assets/dashboard/mesin.png",
				className: "bg-cyan-600",
				count: OrmMesin.count(),
			},
			{
				title: "Customer",
				path: "/app/customer",
				image: "/public/assets/dashboard/customer.png",
				className: "bg-green-600",
				count: OrmCustomer.count(),
			},
			{
				title: "PO",
				path: "/app/customer/po",
				image: "/public/assets/dashboard/po.png",
				className: "bg-green-600",
				count: OrmCustomerPO.count(),
			},
			{
				title: "Kendaraan",
				path: "/app/kendaraan",
				image: "/public/assets/dashboard/kendaraan.png",
				className: "bg-green-600",
				count: OrmKendaraan.count(),
			},
			{
				title: "SPPB In",
				path: "/app/customer/customer_sppb_in",
				image: "/public/assets/dashboard/sppb-in.png",
				className: "bg-green-600",
				count: OrmCustomerSPPBIn.count(),
			},
			{
				title: "SPPB Out",
				path: "/app/customer/customer_sppb_out",
				image: "/public/assets/dashboard/sppb-out.png",
				className: "bg-green-600",
				count: OrmCustomerSPPBOut.count(),
			},
			{
				title: "Kanban",
				path: "/app/kanban",
				image: "/public/assets/dashboard/kanban.png",
				className: "bg-green-600",
				count: OrmKanban.count(),
			},
			{
				title: "Proses Kanban",
				path: "/app/kanban/instruksi",
				image: "/public/assets/dashboard/proses.png",
				className: "bg-green-600",
				count: OrmKanbanInstruksi.count(),
			},
			{
				title: "Parameter",
				path: "/app/parameter",
				image: "/public/assets/dashboard/parameter.png",
				className: "bg-green-600",
				count: OrmParameter.count(),
			},
			{
				title: "Material",
				path: "/app/hardness",
				image: "/public/assets/dashboard/material.png",
				className: "bg-green-600",
				count: OrmMaterial.count(),
			},
			{
				title: "Hardness",
				path: "/app/hardness",
				image: "/public/assets/dashboard/material.png",
				className: "bg-green-600",
				count: OrmHardness.count(),
			},
			{
				title: "Scan Produksi",
				// path: "/app/hardness",
				image: "/public/assets/dashboard/kanban.png",
				className: "bg-green-600",
				count: OrmScan.count({where: {status_produksi: true}}),
			},
			{
				title: "Scan QC",
				// path: "/app/hardness",
				image: "/public/assets/dashboard/kanban.png",
				className: "bg-green-600",
				count: OrmScan.count({where: {status_qc: true}}),
			},
			{
				title: "Scan Finish Good",
				// path: "/app/hardness",
				image: "/public/assets/dashboard/kanban.png",
				className: "bg-green-600",
				count: OrmScan.count({where: {status_finish_good: true}}),
			},
		];

		return Promise.all(
			data.map<Promise<TDashboard>>(async ({image, count, ...item}) => {
				return {
					...item,
					count: await count,
					image: image?.replace("/public", ""),
				};
			}),
		);
	}),
);
