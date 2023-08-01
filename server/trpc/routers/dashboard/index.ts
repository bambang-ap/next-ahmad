import {router} from "@trpc";

import {defaultDashboardRouter} from "./default";

const dashboardRouters = router({...defaultDashboardRouter});

export default dashboardRouters;
