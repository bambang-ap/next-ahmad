import {tRoute, zIds} from '@appTypes/app.zod';
import {formatDateStringView, formatHour} from '@constants';
import {OrmKategoriMesin, OrmMesin, processMapper} from '@database';
import {checkCredentialV2} from '@server';
import {procedure} from '@trpc';
import {qtyReduce} from '@utils';

import moment from 'moment';

import {appRouter} from '..';

const exportScanRouters = {
	scan: procedure.input(zIds.extend(tRoute.shape)).query(({ctx, input}) => {
		type JJJ = Record<
			| 'NO'
			| 'TANGGAL PROSES'
			| 'CUSTOMER'
			| 'PART NAME'
			| 'PART NO'
			| 'WAKTU / JAM PROSES'
			| 'NO LOT CUSTOMER'
			| 'NO LOT IMI'
			| 'PROSES'
			| 'NOMOR KANBAN'
			| 'NOMOR MESIN'
			| 'NAMA MESIN'
			| 'KETERANGAN'
			| 'NOTES',
			string
		>;

		return checkCredentialV2(ctx, async (): Promise<JJJ[]> => {
			const routerCaller = appRouter.createCaller(ctx);
			const data = await routerCaller.print.scan(input);
			const ret: JJJ[] = [];

			for (let i = 0; i < data.length; i++) {
				const val = data[i]!;

				const date = val.updatedAt;

				for (const scnItem of val.dScanItems) {
					const {dKnbItem: knbItem} = scnItem;
					const {dInItem, dItem, dKanban} = knbItem ?? {};
					const {dPo} = dKanban ?? {};
					const {dCust} = dPo ?? {};

					const enIe = qtyReduce((retQty, {qtyKey, unitKey}) => {
						return {
							...retQty,
							[qtyKey]: scnItem[qtyKey],
							[unitKey]: dInItem?.dPoItem[unitKey],
						};
					});

					const instruksi = await processMapper(ctx, dItem);

					const mesinnnn = await OrmMesin.findAll({
						where: dInItem?.id ? {id: dKanban?.list_mesin[dInItem?.id]} : {},
						include: [{model: OrmKategoriMesin, as: OrmKategoriMesin._alias}],
					});

					ret.push({
						NO: (i + 1).toString(),
						'TANGGAL PROSES': date
							? moment(date).format(formatDateStringView)
							: '',
						CUSTOMER: dCust?.name!,
						'PART NAME': dItem?.name!,
						'PART NO': dItem?.kode_item!,
						...enIe,
						'WAKTU / JAM PROSES': date ? moment(date).format(formatHour) : '',
						'NO LOT CUSTOMER': dInItem?.lot_no!,
						'NO LOT IMI': val.lot_no_imi,
						PROSES: instruksi,
						'NOMOR KANBAN': dKanban?.nomor_kanban!,
						'NAMA MESIN': mesinnnn.map(e => e.toJSON().name).join(' | '),
						'NOMOR MESIN': mesinnnn
							.map(e => e.toJSON().nomor_mesin)
							.join(' | '),
						NOTES: val?.notes!,
						KETERANGAN: dKanban?.keterangan ?? '',
					});
				}
			}

			return ret;
		});
	}),
};
export default exportScanRouters;
