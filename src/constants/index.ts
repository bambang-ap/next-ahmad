import {Breakpoint, TextFieldProps} from "@mui/material";
import type {OrderItem} from "sequelize";
import {z} from "zod";

import {AppRouter, TMasterItem, TScanTarget} from "@appTypes/app.type";
import {TRPCClientError} from "@trpc/client";

export * from "./colors";
export * from "./pages";
export * from "./sizes";

export const spacing = 1;
export const gap = `gap-[${spacing}px]`;
export const padding = `p-[${spacing}px]`;

export const IMIConst = {
	name: "PT. INDOHEAT METAL INTI",
	address1: "Jl. Desa Anggadita, Kec. Klari",
	address2: "Karawang, Jawa Barat 41371",
	phone: "(0267) 432168",
	fax: "(0267) 432268",
};

export const Success = {message: "Success"};

export const isProd = process.env.NODE_ENV === "production";

export const defaultLimit = 10;
export const qtyList = [1, 2, 3] as const;

export const SidebarCollapseOn: Breakpoint = "sm";

export const ScanTarget: TScanTarget[] = ["produksi", "qc", "finish_good"];

export const paperA4: [width: number, height: number] = [210, 297];

export const cuttingLineClassName =
	"border border-dashed border-l-0 border-t-0";

export const focusInputClassName =
	"border-2 border-transparent focus-within:border-app-secondary-03";

export const inputClassName = "px-2 py-1 rounded bg-white";

export const defaultExcludeColumn = []; // ['createdAt', 'updatedAt'];
export const defaultOrderBy = {order: [["createdAt", "desc"] as OrderItem]};

export const formatDate = "YYYY-MM-DD";
export const formatHour = "HH:mm:ss";
export const formatFull = `${formatDate} - ${formatHour}`;

export const formatDateView = "DD/MM/YYYY";
export const formatDateStringView = "D MMMM YYYY";
export const formatFullView = `${formatDateView} - ${formatHour}`;

export const decimalRegex = /^(0|[1-9]\d*)(\.\d{1,100})?$/;
export const decimalSchema = z.string().regex(decimalRegex); //.transform(Number);

export const defaultInstruksi: TMasterItem["instruksi"][string][number] = {
	hardness: [""],
	id_instruksi: "",
	material: [""],
	parameter: [""],
	hardnessKategori: [""],
	parameterKategori: [""],
	materialKategori: [""],
};

export const defaultTextFieldProps: TextFieldProps = {
	InputLabelProps: {shrink: true, sx: {paddingBottom: 1}},
	variant: "outlined",
};

export const defaultErrorMutation: {onError: any} = {
	onError: (err: TRPCClientError<AppRouter>) => {
		try {
			JSON.parse(err?.message);
			alert(
				"Mohon periksa kembali data yang Anda isi atau kolom yang belum terisi",
			);
		} catch (e) {
			alert(err?.message);
		}
	},
};
