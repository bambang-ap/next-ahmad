import {z} from "zod";

import {TCustomerSPPBOut} from "@appTypes/app.type";
import {OrmCustomerSPPBOut} from "@database";
import {checkCredentialV2} from "@server";
import {procedure, router} from "@trpc";

type OutResult = Record<
	| "NO"
	| "TANGGAL SJ KELUAR "
	| "CUSTOMER"
	| "NO SURAT JALAN MASUK"
	| "PART NAME / ITEM"
	| "NO PO"
	| "NO SURAT JALAN KELUAR"
	| "PROSES",
	string | number
>;

const exportSppbRouters = router({
	out: procedure
		.input(z.object({ids: z.string().array()}))
		.query(({input, ctx}) => {
			type UU = TCustomerSPPBOut & {};
			return checkCredentialV2(ctx, async (): Promise<OutResult[]> => {
				const data = await OrmCustomerSPPBOut.findAll({where: {id: input.ids}});
				const promisedData = data.map<Promise<OutResult>>(
					async ({dataValues}, index) => {
						const val = dataValues as UU;

						return {
							NO: index + 1,
							"NO PO": "",
							"NO SURAT JALAN KELUAR": "",
							"NO SURAT JALAN MASUK": "",
							"PART NAME / ITEM": "",
							"TANGGAL SJ KELUAR ": "",
							CUSTOMER: "",
							PROSES: "",
						};
					},
				);

				return Promise.all(promisedData);
			});
		}),
});

export default exportSppbRouters;
