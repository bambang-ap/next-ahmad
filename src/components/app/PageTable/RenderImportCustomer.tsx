import {useEffect, useRef, useState} from 'react';

import {TCustomer} from '@appTypes/app.type';
import {Button, Modal, ModalRef, Table} from '@components';
import {CRUD_ENABLED} from '@enum';
import {useLoader} from '@hooks';
import {exportData, importData} from '@utils';
import {trpc} from '@utils/trpc';

export function RenderImportCustomer({refetch}: {refetch: () => unknown}) {
	const modalRef = useRef<ModalRef>(null);
	const [jsonData, setJsonData] = useState<TCustomer[]>();
	const [file, setFile] = useState<File>();

	const {mutateOpts, ...loader} = useLoader();
	const {data: exampleData} = trpc.exampleData.get.useQuery('customer');
	const {mutate} = trpc.basic.mutate.useMutation(mutateOpts);

	function downloadExampleData() {
		exportData(exampleData, ['example-customer']);
	}

	async function mutateInsert(force?: boolean): Promise<any> {
		if (!jsonData) return;

		if (!force) {
			const confirmation = confirm(
				'Data dibawah akan di import, apakah anda yakin?',
			);
			if (!confirmation) return;

			modalRef.current?.hide();
			return mutateInsert(true);
		}

		const bodyPromises = jsonData.map(customer => createPromise(customer));
		await Promise.all(bodyPromises);

		function createPromise(body: TCustomer) {
			return new Promise(() => {
				mutate(
					{target: CRUD_ENABLED.CUSTOMER, type: 'add', body},
					{onSuccess: refetch},
				);
			});
		}
	}

	useEffect(() => {
		importData<TCustomer>(file).then(y => setJsonData(y));
	}, [file]);

	useEffect(() => {
		if (!modalRef.current?.visible) setJsonData(undefined);
	}, [modalRef.current?.visible]);

	return (
		<>
			{loader.component}
			<Button onClick={() => modalRef.current?.show()}>Import</Button>
			<Modal title="Import Customer" ref={modalRef}>
				<div className="flex flex-col gap-2">
					<input
						type="file"
						accept=".xls,.xlsx"
						onChange={e => {
							const selectedFile = e.target.files?.[0];
							if (!selectedFile) return;
							setFile(selectedFile);
						}}
					/>

					<Table
						data={jsonData}
						className="max-h-64 overflow-y-auto"
						header={Object.keys(exampleData?.[0] ?? {})}
						renderItem={({item, Cell}) => {
							return Object.values(item).map((value, i) => (
								<Cell key={i}>{value}</Cell>
							));
						}}
					/>
					<div className="flex gap-2">
						<Button className="flex-1" onClick={downloadExampleData}>
							Download Contoh Data
						</Button>
						{jsonData && (
							<Button className="flex-1" onClick={() => mutateInsert()}>
								Import
							</Button>
						)}
					</div>
				</div>
			</Modal>
		</>
	);
}
