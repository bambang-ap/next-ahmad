import {TScanTarget} from '@appTypes/app.type';
import {ScanTarget} from '@constants';
import {Storage} from '@hoc';

export const StorageScan = new Map<TScanTarget | undefined, Storage<string[]>>(
	[undefined, ...ScanTarget].map(target => [
		target,
		new Storage<string[]>(`Scan-${target}`, []),
	]),
);
