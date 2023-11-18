import {ReadStream} from 'fs';
import html2pdf from 'html-pdf';
import {NextApiRequest, NextApiResponse} from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<string>,
) {
	const html = loadHtml();
	const stream = await createHtml2PdfStream(html);
	res.setHeader('contentType', 'application/pdf');
	res.setHeader('Content-disposition', 'inline; filename="generated.pdf"');
	stream.pipe(res);
}

function loadHtml() {
	return `
	<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Document</title>
</head>
<body>
	<div>jshdfjhgsdfhgsdjf</div>
</body>
</html>
	`;
}

function createHtml2PdfStream(html: string) {
	return new Promise<ReadStream>((resolve, reject) => {
		html2pdf.create(html).toStream((err, stream) => {
			if (err) {
				return reject(err);
			}
			resolve(stream);
		});
	});
}
