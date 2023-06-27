import {router} from "@trpc";

import supplierPoRouters from "./po";

const supplierRouters = router({
	po: supplierPoRouters,
});

export default supplierRouters;
