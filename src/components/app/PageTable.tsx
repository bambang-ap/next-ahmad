import {Suspense, useEffect, useRef, useState} from 'react';

import {useRouter} from 'next/router';
import {Control, useForm, useWatch} from 'react-hook-form';
import * as XLSX from 'xlsx';

import {ModalType, TCustomer} from '@appTypes/app.type';
import {Button, Input, Modal, ModalRef, Select, Table, Text} from '@components';
import {allowedPages, BodyArrayKey, ColUnion} from '@constants';
import {CRUD_ENABLED} from '@enum';
import {trpc} from '@utils/trpc';

export const PageTable = () => {
	const {isReady, asPath} = useRouter();

	const hasPage = allowedPages[asPath as keyof typeof allowedPages];

	if (!isReady || !hasPage) return null;

	return <RenderPage path={asPath} />;
};

const RenderPage = ({path}: {path: string}) => {
	const {
		text,
		table,
		enumName: target,
	} = allowedPages[path as keyof typeof allowedPages] ?? {};

	const modalRef = useRef<ModalRef>(null);
	const {mutate} = trpc.basic.mutate.useMutation({
		onSuccess() {
			refetch();
		},
	});

	const {data: dataTable, refetch} = trpc.basic.get.useQuery({target});
	const {control, handleSubmit, watch, reset} = useForm();

	const modalType = watch('type');
	const modalTitle =
		modalType === 'add'
			? text?.modal?.add
			: modalType === 'edit'
			? text?.modal?.edit
			: text?.modal?.delete;

	const submit = handleSubmit(({type, id, ...rest}) => {
		const onSuccess = () => {
			modalRef.current?.hide();
			refetch();
		};

		switch (type) {
			case 'edit':
				return mutate({target, type, body: {...rest, id}}, {onSuccess});
			case 'delete':
				return mutate({target, type, body: {id}}, {onSuccess});
			default:
				return mutate({target, type, body: rest}, {onSuccess});
		}
	});

	function showModal(type: ModalType, initValue: {}) {
		reset({...initValue, type});
		modalRef.current?.show();
	}

	return (
		<>
			<Modal title={modalTitle} ref={modalRef}>
				<form onSubmit={submit}>
					<ModalChild path={path} control={control} />
				</form>
			</Modal>
			<div className="overflow-x-auto w-full">
				<Button onClick={() => showModal('add', {})}>Add</Button>
				{/* NOTE: Import CSV with popup generated - untuk sementara page customer saja */}
				{target === CRUD_ENABLED.CUSTOMER && (
					<Suspense>
						<RenderImportCustomer refetch={refetch} />
					</Suspense>
				)}

				<Table
					data={dataTable ?? []}
					header={table?.header}
					renderItem={({item, Cell}) => {
						const {id, ...rest} = item;

						return (
							<>
								{table?.body?.map?.(key => {
									if (Array.isArray(key))
										return (
											<Cell>
												<A item={item} keys={key} />
											</Cell>
										);

									return (
										<Cell key={key}>
											<Text>{item[key]}</Text>
										</Cell>
									);
								})}
								<Cell className="flex gap-x-2">
									<Button onClick={() => showModal('edit', {id, ...rest})}>
										Edit
									</Button>
									<Button onClick={() => showModal('delete', {id})}>
										Delete
									</Button>
								</Cell>
							</>
						);
					}}
				/>
			</div>
		</>
	);
};

const A = ({item, keys}: {item: any; keys: BodyArrayKey<any>}) => {
	const [, useQuery, finder] = keys;

	const {data} = useQuery();
	const h = finder?.(item, data);

	return <Text>{h}</Text>;
};

const ModalChild = ({control, path}: {control: Control; path: string}) => {
	const {modalField} = allowedPages[path as keyof typeof allowedPages] ?? {};

	const modalType = useWatch({control, name: 'type'});

	if (modalType === 'delete') {
		return (
			<div>
				<Text>Hapus ?</Text>
				<Button type="submit">Ya</Button>
			</div>
		);
	}

	return (
		<>
			{(modalType === 'add' || modalType === 'edit') &&
				modalField?.[modalType]?.map(item => (
					<RenderField key={item.col} control={control} item={item} />
				))}

			<Button type="submit">Submit</Button>
		</>
	);
};

type RenderFieldProps = {control: Control; item: ColUnion};

const RenderField = (props: RenderFieldProps) => {
	const {control, item} = props;
	const {col, label} = item;

	if (item.type === 'select') {
		const query = item.dataQuery();

		return (
			<Select
				control={control}
				fieldName={col}
				firstOption={item.firstOption}
				data={item.dataMapping(query.data) ?? []}
			/>
		);
	}

	return (
		<Input
			type={item.type}
			label={label}
			control={control}
			fieldName={col}
			placeholder={col}
		/>
	);
};

function RenderImportCustomer({refetch}: {refetch: () => unknown}) {
	const modalRef = useRef<ModalRef>(null);
	const [jsonData, setJsonData] = useState<TCustomer[]>();
	const [file, setFile] = useState<File>();

	const {data: exampleData} = trpc.exampleData.get.useQuery('customer');
	const {mutate} = trpc.basic.mutate.useMutation();

	async function mutateInsert(force?: boolean): void {
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
							return Object.values(item).map(value => {
								return <Cell>{value}</Cell>;
							});
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
