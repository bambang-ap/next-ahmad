import {useForm} from "react-hook-form";

import {TDashboardView} from "@appTypes/app.type";
import {ButtonGroup} from "@components";
import {DashboardSelectView} from "@constants";

import TotalCount from "./TotalCount";

export default function Dashboard() {
	const {control, watch} = useForm<{view: TDashboardView}>();

	const {view} = watch();

	const selection = (
		<ButtonGroup
			className="mb-4"
			fieldName="view"
			control={control}
			data={DashboardSelectView}
			defaultValue={DashboardSelectView?.[0]?.value}
		/>
	);

	switch (view) {
		case "bar":
			return <>{selection}</>;
		default:
			return (
				<>
					{selection}
					<TotalCount />
				</>
			);
	}
}
