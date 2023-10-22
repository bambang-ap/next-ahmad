import {useRouter} from 'next/router';

import {Button} from '@components';
import {getLayout} from '@hoc';

InventoryInternal.getLayout = getLayout;

export default function InventoryInternal() {
	const {push} = useRouter();

	return (
		<div className="flex gap-2">
			<Button onClick={() => push('/app/internal/form')}>
				Form Permintaan
			</Button>
			<Button onClick={() => push('/app/internal/po')}>PO</Button>
			<Button onClick={() => push('/app/internal/sj_in')}>SJ Masuk</Button>
			<Button onClick={() => push('/app/internal/item')}>Item</Button>
			<Button onClick={() => push('/app/internal/supplier')}>Supplier</Button>
		</div>
	);
}
