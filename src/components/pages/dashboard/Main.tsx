import {RootTable as Table} from "@baseComps/Table";
import {qtyList, unitData} from "@constants";
import {BorderTd} from "@pageComponent/KanbanCard";
import type {J} from "@trpc/routers/dashboard/main";
import {qtyMap} from "@utils";
import {trpc} from "@utils/trpc";

const {TBody, THead, Tr} = Table;

type Data = [name: string, data?: J];

export default function MainDashboard() {
	const {data: dataPo} = trpc.dashboard.main.po.useQuery();
	const {data: dataSppbIn} = trpc.dashboard.main.sppbIn.useQuery();
	const {data: dataKanban} = trpc.dashboard.main.kanban.useQuery();

	const dataList: Data[] = [
		["PO", dataPo],
		["SJ masuk", dataSppbIn],
		["Kanban", dataKanban],
	];

	const header = dataList.map(e => e[0]);

	return (
		<>
			<Table className="!w-max overflow-x-scroll">
				<THead>
					<Tr>
						<BorderTd width={200} center rowSpan={2}>
							Unit
						</BorderTd>
						{header.map(e => (
							<BorderTd key={e} center colSpan={qtyList.length}>
								{e}
							</BorderTd>
						))}
					</Tr>
					<Tr>
						{header.map(() =>
							qtyMap(({num}) => (
								<BorderTd width={100} center>
									Qty {num}
								</BorderTd>
							)),
						)}
					</Tr>
				</THead>
				<TBody>
					{unitData.map(unit => {
						return (
							<Tr key={unit}>
								<BorderTd>{unit}</BorderTd>
								{dataList.map(([, summary]) => {
									return qtyMap(({num}) => {
										const qtyData = summary?.[num].find(e => e.unit === unit);
										const hasQty = !!qtyData?.qty;
										return (
											<BorderTd className="text-end">
												{hasQty
													? new Intl.NumberFormat("id-ID").format(qtyData?.qty)
													: "-"}
											</BorderTd>
										);
									});
								})}
							</Tr>
						);
					})}
				</TBody>
			</Table>
		</>
	);
}
