import {Route} from "pages/app/scan/[route]";
import {Text, Wrapper} from "pages/app/scan/[route]/list";

import {cuttingLineClassName, gap, padding} from "@constants";
import {printScanAttributes} from "@database";
import {classNames, moment, scanMapperByStatus} from "@utils";

import {RenderItems} from "./RenderItem";

export type D = ReturnType<typeof printScanAttributes>["Ret"];

export function RenderPdfData({
	data,
	route,
	className,
}: Route & {data: D; className?: string}) {
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
				<Wrapper title="Customer">
					{data.dScanItems
						.map(item => item.dKnbItem?.dKanban.dPo.dCust.name)
						.join("")}
				</Wrapper>
				<Wrapper title="Tgl / Bln / Thn">
					{moment(data?.updatedAt).format("D MMMM YYYY")}
				</Wrapper>
				<Wrapper title="Nomor Lot IMI">{data?.lot_no_imi}</Wrapper>
				<RenderItems data={data} />
			</div>
		</div>
	);
}
