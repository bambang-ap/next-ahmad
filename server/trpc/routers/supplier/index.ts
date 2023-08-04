import {router} from "@trpc";

import supplierItemRouters from "./item";
import supplierPoRouters from "./po";
import supplierRouters from "./supplier";

const supplierRouter = router({
	...supplierRouters,
	po: supplierPoRouters,
	item: supplierItemRouters,
});

export default supplierRouter;
