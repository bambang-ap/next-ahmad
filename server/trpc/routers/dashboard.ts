import {TDashboard, TDashboardInput} from "@appTypes/app.zod";
import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerSPPBIn,
	OrmCustomerSPPBOut,
	OrmKanban,
	OrmKendaraan,
	OrmMesin,
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
