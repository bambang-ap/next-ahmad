import {useWatch} from "react-hook-form";

import {FormProps} from "@appTypes/app.type";
import {Icon} from "@baseComps/Icon";
import {RootTable as Table} from "@baseComps/Table";
import {unitData} from "@constants";
import {useQtyData} from "@hooks";
import {BorderTd} from "@pageComponent/KanbanCard";
import {classNames} from "@utils";

import {FormValue} from "./";

const {TBody, THead, Tr} = Table;

export default function QtyTable({
	control,
	setValue,
}: FormProps<FormValue, "control" | "setValue">) {
	const {dataList, qtyParser} = useQtyData();

	const titleClassName = "text-lg bg-zinc-500 text-white";

	const header = dataList.map(([a, , b]) => [a, b]);

	const {type} = useWatch({control});

	return (
		<>
			<Table className="overflow-x-scroll">
				<THead>
					<Tr>
						<BorderTd className={titleClassName} width={200} center>
							Unit
						</BorderTd>
						{header.map(([category, className]) => (
							<BorderTd
								center
								key={category}
								className={classNames("text-lg", className)}>
								{category}
							</BorderTd>
						))}
					</Tr>
				</THead>
				<TBody>
					{unitData.map(unit => {
						const qtys = qtyParser(unit);

						return (
							<Tr key={unit}>
								<BorderTd
									onClick={() => setValue("type", unit)}
									className={classNames(
										"cursor-pointer hover:opacity-80",
										titleClassName,
									)}>
									<div className="gap-2 flex items-center">
										<div className="flex-1">{unit.ucwords()}</div>
										{unit === type && <Icon name="faCheck" />}
									</div>
								</BorderTd>
								{qtys.map(([, qty, className], index) => (
									<BorderTd
										key={`${unit}${index}`}
										className={classNames("text-end", className)}>
										{!!qty ? new Intl.NumberFormat("id-ID").format(qty) : "-"}
									</BorderTd>
								))}
							</Tr>
						);
					})}
				</TBody>
			</Table>
		</>
	);
}
