import {useEffect, useRef, useState} from 'react';

import * as XLSX from 'xlsx';

import {TCustomer} from '@appTypes/app.type';
import {Button, Modal, ModalRef, Table} from '@components';
import {defaultErrorMutation} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {trpc} from '@utils/trpc';

export function RenderImportCustomer({refetch}: {refetch: () => unknown}) {
	const modalRef = useRef<ModalRef>(null);
	const [jsonData, setJsonData] = useState<TCustomer[]>();
	const [file, setFile] = useState<File>();

	const {data: exampleData} = trpc.exampleData.get.useQuery('customer');
	const {mutate} = trpc.basic.mutate.useMutation(defaultErrorMutation);

	async function mutateInsert(force?: boolean): Promise<void> {
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

	function downloadExampleData() {
		if (!exampleData) return;

		const sheetName = 'Sheet 1';
		const workbook = XLSX.utils.book_new();
		workbook.SheetNames.push(sheetName);
		workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(exampleData);
		XLSX.writeFile(workbook, `example-customer.xlsx`);
	}

	function convertToJson() {
		if (!file) return;

		const fileReader = new FileReader();
		fileReader.onload = event => {
			const data = event.target?.result;

			const workbook = XLSX.read(data, {type: 'binary'});

			Object.values(workbook.Sheets).forEach((sheet, i) => {
				if (i > 0) return;

				const rowObject = XLSX.utils.sheet_to_json(sheet);
				setJsonData(rowObject as TCustomer[]);
			});
		};

		fileReader.readAsBinaryString(file);
	}

	useEffect(convertToJson, [file]);
	useEffect(() => {
		if (!modalRef.current?.visible) setJsonData(undefined);
	}, [modalRef.current?.visible]);

	return (
		<>
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
