import {
	TCustomer,
	THardness,
	THardnessKategori,
	TInstruksiKanban,
	TMaterialKategori,
	TMesin,
	TParameter,
	TParameterKategori,
} from '@appTypes/app.zod';
import {CRUD_ENABLED} from '@enum';
import {trpc} from '@utils/trpc';

export function useKanban() {
	const {data: dataKanban} = trpc.kanban.get.useQuery({type: 'kanban'});
	const {data: dataCustomer} = trpc.basic.get.useQuery<any, TCustomer[]>({
		target: CRUD_ENABLED.CUSTOMER,
	});
	const {data: dataMesin} = trpc.basic.get.useQuery<any, TMesin[]>({
		target: CRUD_ENABLED.MESIN,
	});
	const {data: dataInstruksi} = trpc.basic.get.useQuery<
		any,
		TInstruksiKanban[]
	>({
		target: CRUD_ENABLED.INSTRUKSI_KANBAN,
	});
	const {data: dataPo} = trpc.customer_po.get.useQuery({
		type: 'customer_po',
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
	const {data: dataSppbIn} = trpc.sppb.in.get.useQuery({
		type: 'sppb_in',
	});

	return {
		dataSppbIn,
		dataKanban,
		dataCustomer,
		dataMesin,
		dataInstruksi,
		dataPo,
		hardnessData,
		parameterData,
		materialData,
		parameterKategori,
		hardnessKategori,
		materialKategori,
	};
}
