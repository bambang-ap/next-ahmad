import bufferToDataUrl from 'buffer-to-data-url';
import qr, {image_type} from 'qr-image';
import {z} from 'zod';

import {tCustomer} from '@appTypes/app.zod';
import {getNow} from '@server';
import {procedure, router} from '@trpc';

const asd = z.string().or(z.string().array()).optional();

const miscRouter = {
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
	exampleData: router({
		get: procedure.input(z.enum(['customer'])).query(({input}) => {
			switch (input) {
				case 'customer':
					return generateShape(tCustomer);
			}

			function generateShape<T extends z.ZodRawShape>(schema: z.ZodObject<T>) {
				return [
					Object.keys(schema.shape).reduce<MyObject>((ret, key) => {
						if (key === 'id') return ret;

						return {...ret, [key as string]: ''};
					}, {}),
				];
			}
		}),
	}),
};

export default miscRouter;
