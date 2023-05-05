import {useRouter} from "next/router";
import {Control, useForm} from "react-hook-form";

import {TDataScan} from "@appTypes/app.type";
import {TScan, TScanItem, TScanTarget, ZId} from "@appTypes/app.zod";
import {FormScreenProps} from "@appTypes/props.type";
import {Button, Form, Input} from "@components";
import {defaultErrorMutation} from "@constants";
import {getLayout} from "@hoc";
import {ScanDetailKanban} from "@pageComponent/scan_GenerateQR";
import {scanMapperByStatus} from "@utils";
import {trpc} from "@utils/trpc";

Scan.getLayout = getLayout;

type Route = {route: TScanTarget};

export type FormTypeScan = Pick<TScan, keyof TScanItem | "lot_no_imi" | "id">;
export type FormType = {
	form: ZId[];
};

export default function Scan() {
	const form = useForm<FormType>({defaultValues: {form: []}});

	const {isReady, ...router} = useRouter();

	const {control, reset, watch} = form;
	const {route} = router.query as Route;

	const ids = watch("form");

	function addNew() {
		reset(prev => ({form: [...prev.form, {id: ""}]}));
	}

	if (!isReady) return null;

	return (
		<div className="flex flex-col gap-2">
			<Button onClick={addNew}>Tambah</Button>
			{ids.map((data, index) => (
				<RenderScanPage
					route={route}
					key={index}
					index={index}
					control={control}
					reset={reset}
					id={data.id}
				/>
			))}
		</div>
	);
}

function RenderScanPage(
	props: {
		index: number;
	} & ZId &
		Route &
		FormScreenProps<FormType, "control" | "reset">,
) {
	const {control, reset, id, index, route} = props;
	const {control: controlScan} = useForm<FormTypeScan>({defaultValues: {id}});
	const {data: dataScan /* refetch */} = trpc.scan.get.useQuery(
		{id, target: route},
		{enabled: !!id, ...defaultErrorMutation},
	);

	// const {mutate} = trpc.scan.update.useMutation({
	// 	...defaultErrorMutation,
	// 	onSuccess: () => refetch(),
	// });

	const currentKey = `status_${route}` as const;
	const status = dataScan?.[currentKey];
	const [, , submitText] = scanMapperByStatus(route);

	function remove() {
		reset(prev => ({form: prev.form.remove(index)}));
	}

	return (
		<>
			<Form
				// onSubmit={submit}
				context={{disableSubmit: status, disabled: status}}>
				{/* <Scanner ref={qrcodeRef} title={`Scan ${route}`} onRead={onRead} /> */}
				<div className="flex gap-2">
					<Input
						className="flex-1"
						control={control}
						fieldName={`form.${index}.id`}
					/>
					<Button
						icon={status ? "faEyeSlash" : "faCircleXmark"}
						onClick={remove}
					/>
					{!!dataScan && (
						<Button disabled={status} type="submit">
							{submitText}
						</Button>
					)}
					{dataScan && (
						<RenderDataKanban
							{...dataScan}
							control={controlScan}
							route={route}
						/>
					)}
				</div>
			</Form>
		</>
	);
}

function RenderDataKanban(
	kanban: TDataScan & Route & {control: Control<FormTypeScan>},
) {
	const {dataKanban, route, control, ...rest} = kanban;

	const [kanbans] = dataKanban ?? [];

	const currentKey = `status_${route}` as const;

	const currentStatus = rest[currentKey];

	if (!kanbans) return null;

	return (
		<>
			{currentStatus}
			<ScanDetailKanban
				route={route}
				control={control}
				status={currentStatus}
				{...kanbans}
			/>
		</>
	);
}
