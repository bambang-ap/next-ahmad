import {router} from "@trpc";

import supplierItemRouters from "./item";
import supplierPoRouters from "./po";

const supplierRouters = router({
	po: supplierPoRouters,
	item: supplierItemRouters,
});

export default supplierRouters;
