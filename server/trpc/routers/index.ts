import qr from 'qr-image';
import {z} from 'zod';

import {getNow} from '@server';
import {procedure, router} from '@trpc';

import basicRouters from './basic';
import customer_poRouters from './customer_po';
import kanbanRouters from './kanban';
import menuRouters from './menu';

export const appRouter = router({
	now: procedure.query(() => {
		const today = getNow();

		return today;
	}),
	qr: procedure.input(z.string()).query(({input}) => {
		const qr_svg = qr.imageSync(input, {
			type: 'svg',
		});

		return `data:image/svg+xml;utf8,${qr_svg}`;
	}),
	menu: menuRouters,
	basic: basicRouters,
	customer_po: customer_poRouters,
	kanban: kanbanRouters,
});

export type AppRouter = typeof appRouter;
