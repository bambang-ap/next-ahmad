import moment from "moment";
import {Route} from "pages/app/scan/[route]";
import {Text, Wrapper} from "pages/app/scan/[route]/list";

import {KanbanGetRow} from "@appTypes/app.type";
import {cuttingLineClassName, gap, padding} from "@constants";
import {classNames, scanMapperByStatus} from "@utils";

import {RenderItem} from "./RenderItem";

export function RenderPdfData({
	data,
	route,
	className,
}: Route & {data?: null | KanbanGetRow; className?: string}) {
	const items = Object.entries(data?.items ?? {});
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
					{data?.OrmCustomerPO?.OrmCustomer.name}
				</Wrapper>
				<Wrapper title="Tgl / Bln / Thn">
					{moment(data?.createdAt).format("D MMMM YYYY")}
				</Wrapper>
				<Wrapper title="Nomor Lot IMI">{data?.dataScan?.lot_no_imi}</Wrapper>
				{items.map(item => (
					<RenderItem key={item[0]} item={item} />
				))}
			</div>
		</div>
	);
}
