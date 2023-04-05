import {router} from '@trpc';

import sppbInRouters from './in';
import sppbOutRouters from './out';

const sppbRouters = router({
	in: sppbInRouters,
	out: sppbOutRouters,
});

export default sppbRouters;
