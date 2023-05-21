import {useRecoilValue} from "recoil";

import {
	TCustomer,
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TMaterialKategori,
	TMesin,
	TParameter,
	TParameterKategori,
} from "@appTypes/app.zod";
import {CRUD_ENABLED} from "@enum";
import {atomDataKanban} from "@recoil/atoms";
import {trpc} from "@utils/trpc";

export function useAdditionalData() {
	const {data: dataInstruksi} = trpc.basic.get.useQuery<
		any,
		TInstruksiKanban[]
	>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});

	const {data: materialData} = trpc.basic.get.useQuery<any, TParameter[]>({
		target: CRUD_ENABLED.MATERIAL,
	});

	const {data: hardnessData} = trpc.basic.get.useQuery<any, THardness[]>({
		target: CRUD_ENABLED.HARDNESS,
	});

	const {data: parameterData} = trpc.basic.get.useQuery<any, TParameter[]>({
		target: CRUD_ENABLED.PARAMETER,
	});

	const {data: parameterKategori} = trpc.basic.get.useQuery<
		any,
		TParameterKategori[]
	>({
		target: CRUD_ENABLED.PARAMETER_KATEGORI,
	});

	const {data: hardnessKategori} = trpc.basic.get.useQuery<
		any,
		THardnessKategori[]
	>({
		target: CRUD_ENABLED.HARDNESS_KATEGORI,
	});

	const {data: materialKategori} = trpc.basic.get.useQuery<
		any,
		TMaterialKategori[]
	>({
		target: CRUD_ENABLED.MATERIAL_KATEGORI,
	});

	return {
		dataInstruksi,
		hardnessData,
		hardnessKategori,
		materialData,
		materialKategori,
		parameterData,
		parameterKategori,
	};
}

export function useKanban() {
	const additionalData = useAdditionalData();
	const dataKanban = useRecoilValue(atomDataKanban);

	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {data: dataMesin} = trpc.basic.get.useQuery<any, TMesin[]>({
		target: CRUD_ENABLED.MESIN,
	});
	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: "customer_po",
	});
	const {data: dataSppbIn} = trpc.sppb.in.get.useQuery({
		type: "sppb_in",
	});

	return {
		...additionalData,
		dataCustomer,
		dataKanban,
		dataMesin,
		dataPo,
		dataSppbIn,
	};
}
