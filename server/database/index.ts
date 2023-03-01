import {tScan} from '@appTypes/app.zod';
import {generateAttributes} from '@dbUtils/attributeParser';
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

export const OrmScan = generateAttributes(TABLES.SCAN, tScan, 'id');
