import {useWatch} from "react-hook-form";

import {TableFilter} from "@components";
import {useTableFilter} from "@hooks";

function TableFilterV4(props) {
	const {useQuery, control, header = [], ...tableProps} = props;

	const {formValue, hookForm} = useTableFilter();
	const {data, refetch} = useQuery(formValue);

	const dataForm = useWatch({control});

	return (
		<>
			<TableFilter
				{...tableProps}
				form={hookForm}
				data={data}
				topComponent={topComponent}
				header={[
					isSelect && (
						<SelectAllButton
							// @ts-ignore
							data={data?.rows}
							form={dataForm}
							property={property}
							key="btnSelectAll"
							onClick={prev => reset(prev)}
							selected={selectedIds.length}
							total={data?.rows.length}
							selector={selector}
						/>
					),
					...header,
				]}
			/>
		</>
	);
}
