import bufferToDataUrl from 'buffer-to-data-url';
import qr, {image_type} from 'qr-image';
import {z} from 'zod';

import {getNow} from '@server';
import {procedure, router} from '@trpc';

import basicRouters from './basic';
import customer_poRouters from './customer_po';
import kanbanRouters from './kanban';
import menuRouters from './menu';
import scanRouters from './scan';
import sppbRouters from './sppb';

const asd = z.string().or(z.string().array()).optional();

export const appRouter = router({
	now: procedure.query(() => {
		const today = getNow();
		return today;
	}),
	qr: procedure
		.input(
			asd.or(
				z.object({
					type: z.enum(['png', 'svg', 'pdf', 'eps']).optional(),
					input: asd,
				}),
			),
		)
		.query(({input}) => {
			function generateQr(type: image_type, input?: string) {
				if (!input) return null;

				const qrImage = qr.imageSync(input, {type});

				if (type === 'svg') return `data:image/svg+xml;utf8,${qrImage}`;

				return bufferToDataUrl(`image/${type}`, qrImage);
			}

			function renderQrGenerated(
				input?: string | string[],
				type: image_type = 'svg',
			) {
				if (Array.isArray(input))
					return input.map(input => generateQr(type, input));

				return generateQr(type, input);
			}

			if (!input) return null;

			if (typeof input === 'string' || Array.isArray(input))
				return renderQrGenerated(input);

			return renderQrGenerated(input.input, input.type);
		}),
	menu: menuRouters,
	basic: basicRouters,
	customer_po: customer_poRouters,
	kanban: kanbanRouters,
	scan: scanRouters,
	sppb: sppbRouters,
});

export type AppRouter = typeof appRouter;
