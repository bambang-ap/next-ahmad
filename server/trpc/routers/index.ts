import {router} from "@trpc";
import {inferRouterInputs, inferRouterOutputs} from "@trpc/server";

import basicRouters from "./basic";
import customer_poRouters from "./customer_po";
import dashboardRouters from "./dashboard";
import exportRouters from "./export";
import itemRouters from "./item";
import kanbanRouters from "./kanban";
import menuRouters from "./menu";
import miscRouter from "./misc";
import printRouters from "./print";
import rejectRouters from "./reject";
import scanRouters from "./scan";
import sppbRouters from "./sppb";
import supplierRouters from "./supplier";
import user_loginRouters from "./user_login";

export const appRouter = router({
	...miscRouter,
	supplier: supplierRouters,
	menu: menuRouters,
	item: itemRouters,
	basic: basicRouters,
	customer_po: customer_poRouters,
	user_login: user_loginRouters,
	kanban: kanbanRouters,
	scan: scanRouters,
	sppb: sppbRouters,
	dashboard: dashboardRouters,
	export: exportRouters,
	print: printRouters,
	reject: rejectRouters,
});

export type AppRouter = typeof appRouter;
export type AppRouterCaller = ReturnType<AppRouter["createCaller"]>;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
