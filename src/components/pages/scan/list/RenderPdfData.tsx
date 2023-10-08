import {Route} from "pages/app/scan/[route]";
import {Text, Wrapper} from "pages/app/scan/[route]/list";

import {RouterOutput} from "@appTypes/app.type";
import {cuttingLineClassName, gap, padding} from "@constants";
import {classNames, moment, scanMapperByStatus} from "@utils";

import {RenderItem} from "./RenderItem";

export function RenderPdfData({
	data,
	route,
	className,
}: Route & {data: RouterOutput["print"]["scan"][number]; className?: string}) {
	const [, , , , /* formName */ cardName] = scanMapperByStatus(route);

	return (
		<div className={classNames("p-6", className, cuttingLineClassName)}>
			<div className={classNames(gap, padding, "flex flex-col bg-black")}>
				<div className={classNames("flex", gap)}>
					<div className="bg-white flex justify-center flex-1 p-2">
						<Text className="self-center text-4xl text-center">IMI</Text>
					</div>
					<div className="bg-white flex justify-center flex-1 p-2">
						<Text className="self-center text-xl text-center">{cardName}</Text>
					</div>
					<div className={classNames("flex flex-col flex-1", gap)}>
						<div className="bg-white flex justify-center flex-1 p-2">
							<Text className="self-center">IMI/FORM/QC/01-14</Text>
							{/* <Text className="self-center">{formId}</Text> */}
						</div>
						<div className="bg-white flex justify-center flex-1 p-1">
							<Text className="self-center">Revisi : 0</Text>
						</div>
						<div className="bg-white flex justify-center flex-1 p-1">
							<Text className="self-center">Terbit : A</Text>
						</div>
					</div>
				</div>
				<Wrapper title="Customer">{data?.dKanban?.dPo?.dCust.name}</Wrapper>
				<Wrapper title="Tgl / Bln / Thn">
					{moment(data?.createdAt).format("D MMMM YYYY")}
				</Wrapper>
				<Wrapper title="Nomor Lot IMI">{data?.lot_no_imi}</Wrapper>
				<RenderItem data={data} route={route} />
			</div>
		</div>
	);
}
