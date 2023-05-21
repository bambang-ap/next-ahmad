import {router} from "@trpc";
import {inferRouterInputs, inferRouterOutputs} from "@trpc/server";

import basicRouters from "./basic";
import customer_poRouters from "./customer_po";
import {dashboardRouter} from "./dashboard";
import itemRouters from "./item";
import kanbanRouters from "./kanban";
import menuRouters from "./menu";
import miscRouter from "./misc";
import scanRouters from "./scan";
import sppbRouters from "./sppb";
import user_loginRouters from "./user_login";

export const appRouter = router({
	...miscRouter,
	menu: menuRouters,
	item: itemRouters,
	basic: basicRouters,
	customer_po: customer_poRouters,
	user_login: user_loginRouters,
	kanban: kanbanRouters,
	scan: scanRouters,
	sppb: sppbRouters,
	dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
export type AppRouterCaller = ReturnType<AppRouter["createCaller"]>;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
