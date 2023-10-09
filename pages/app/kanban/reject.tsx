import {useEffect} from "react";

import {useForm} from "react-hook-form";
import {useSetRecoilState} from "recoil";

import {ModalTypeSelect} from "@appTypes/app.type";
import {REJECT_REASON_VIEW} from "@enum";
import {getLayout} from "@hoc";
import {useTableFilterComponent} from "@hooks";
import {atomHeaderTitle} from "@recoil/atoms";
import {RejectRetType} from "@trpc/routers/reject";
import {getIds, nullRenderItem, nullUseQuery} from "@utils";
import {trpc} from "@utils/trpc";

RejectList.getLayout = getLayout;

type FormType = RejectRetType & {
	type: ModalTypeSelect;
	selectedIds?: MyObject<boolean>;
};

export default function RejectList() {
	const setTitle = useSetRecoilState(atomHeaderTitle);

	const {control, reset, watch} = useForm<FormType>();

	const formData = watch();

	const {property} = getIds(formData, "selectedIds");

	const {component} = useTableFilterComponent({
		control,
		reset,
		property,
		exportUseQuery: nullUseQuery,
		exportRenderItem: nullRenderItem,
		header: ["Reason", "Status", "Lot No IMI"],
		useQuery: form => trpc.reject.get.useQuery(form),
		renderItem: ({Cell, CellSelect, item}) => {
			return (
				<>
					<CellSelect fieldName={`selectedIds.${item.id}`} />
					<Cell>{REJECT_REASON_VIEW[item.reason]}</Cell>
					<Cell>{item.dScanItem.dScan.status}</Cell>
					<Cell>{item.dScanItem.dScan.lot_no_imi}</Cell>
				</>
			);
		},
	});

	useEffect(() => {
		setTitle("Reject Item List");
	}, []);

	return <>{component}</>;
}
