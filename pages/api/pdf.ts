import jsPDF from 'jspdf';
import {NextApiHandler} from 'next';

import {appRouter} from '@trpc/routers';

const generatePdf: NextApiHandler = async (req, res) => {
	let y = 10;
	const doc = new jsPDF();
	const routerCaller = appRouter.createCaller({req, res});

	const data = await routerCaller.kanban.get({
		type: 'kanban',
	});
	const qrImages = (await routerCaller.qr({
		input: data?.map(f => f.id),
		type: 'png',
	})) as string[];

	// data.forEach((item, i) => {
	// 	const {po, instruksi_kanban, mesin, nomor_po, sppbin} = item;
	// 	const {customer, po_item} = po?.[0] ?? {};

	// 	// if (qrImages[i])
	// 	// 	doc.addImage({
	// 	// 		imageData: qrImages[i] as string,
	// 	// 		style: {backgroundColor: 'green'},
	// 	// 	});
	// 	y += 10;
	// 	doc.text(`customerName - ${customer?.name}`, 10, y);
	// 	y += 10;
	// 	doc.text(`nomor po - ${nomor_po}`, 10, y);
	// 	y += 10;
	// 	doc.text(`instruksi - ${instruksi_kanban?.[0]?.name}`, 10, y);
	// 	y += 10;
	// 	doc.text(`nama mesin - ${mesin?.[0]?.name}`, 10, y);
	// 	y += 10;

	// 	sppbin?.forEach(sppb => {
	// 		doc.text(`nomor surat jalan - ${sppb.name}`, 10, y);
	// 		y += 10;

	// 		doc.text(`sppb in item`, 10, y);
	// 		y += 10;

	// 		autoTable(doc, {
	// 			// head: [['Name', 'Email', 'Country']],
	// 			body: sppb.items?.map(({id, qty}) => {
	// 				const poItem = po_item?.find(itm => id === itm.id);

	// 				return [poItem?.kode_item, poItem?.name, qty, poItem?.unit];
	// 			}),
	// 		});

	// 		// sppb.items?.forEach(({id, qty}) => {
	// 		// 	const poItem = po_item?.find(itm => id === itm.id);
	// 		// 	doc.text(`${poItem?.kode_item}`, 10, y);
	// 		// 	y += 10;
	// 		// 	doc.text(`${poItem?.name}`, 10, y);
	// 		// 	y += 10;
	// 		// 	doc.text(`${qty}`, 10, y);
	// 		// 	y += 10;
	// 		// 	doc.text(`${poItem?.unit}`, 10, y);
	// 		// 	y += 10;
	// 		// });
	// 	});
	// });

	res.setHeader('Content-Type', 'application/pdf').send(doc.output());
};

export default generatePdf;
