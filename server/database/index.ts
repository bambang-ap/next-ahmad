import {generateAttributes} from '@dbUtils/attributeParser';

import {
	tScanFinishGood,
	tScanOutBarang,
	tScanProduksi,
	tScanQc,
} from '@appTypes/app.zod';
import {TABLES} from '@enum';

export * from './customer';
export * from './customer_po';
export * from './customer_po_item';
export * from './customer_sppb_in';
export * from './customer_sppb_out';
export * from './kanban';
export * from './kanban_instruksi';
export * from './menu';
export * from './mesin';
export * from './role';
export * from './user';

export const OrmScanProduksi = generateAttributes(
	TABLES.SCAN_PRODUKSI,
	tScanProduksi,
	'id',
);

export const OrmScanQC = generateAttributes(TABLES.SCAN_QC, tScanQc, 'id');

export const OrmScanFinishGood = generateAttributes(
	TABLES.SCAN_FINISH_GOOD,
	tScanFinishGood,
	'id',
);

export const OrmScanOutBarang = generateAttributes(
	TABLES.SCAN_OUT_BARANG,
	tScanOutBarang,
	'id',
);
