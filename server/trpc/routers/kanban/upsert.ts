import {TKanban, tKanbanUpsert, TScanNew} from '@appTypes/app.zod';
import {Success} from '@constants';
import {
	dKanban,
	dScan,
	ORM,
	OrmDocument,
	OrmKanban,
	OrmKanbanItem,
} from '@database';
import {IndexNumber} from '@enum';
import {checkCredentialV2, generateId, genNumberIndexUpsert} from '@server';
import {procedure} from '@trpc';
import {TRPCError} from '@trpc/server';

export const kanbanUpsert = {
	upsert: procedure
		.input(tKanbanUpsert)
		.mutation(async ({input, ctx: {req, res}}) => {
			return checkCredentialV2({req, res}, async session => {
				const transaction = await ORM.transaction();
				try {
					const docData = await OrmDocument.findOne();

					if (!docData) {
						throw new TRPCError({
							code: 'NOT_FOUND',
							message: 'Doc number not found',
						});
					}

					const {
						items: kanban_items,
						id = generateId('KNB_'),
						createdBy = session.user?.id,
						doc_id = docData.dataValues.id,
						...rest
					} = input;
					const anban = id
						? await dKanban.findOne({where: {id}, include: [dScan]})
						: null;

					const hasKanban = anban?.toJSON() as
						| null
						| (TKanban & {dScans: TScanNew[]});

					if (!!hasKanban && hasKanban.dScans.length > 0) {
						throw new TRPCError({
							code: 'FORBIDDEN',
							message: 'Silahkan hapus scan produksi terlebih dahulu',
						});
					}

					const kanbanUpsertValue = await genNumberIndexUpsert(
						OrmKanban,
						IndexNumber.Kanban,
						{
							...rest,
							id,
							doc_id,
							createdBy,
							updatedBy: session.user?.id!,
							nomor_kanban: hasKanban?.nomor_kanban,
						},
					);
					const [createdKanban] = await OrmKanban.upsert(kanbanUpsertValue, {
						transaction,
					});

					const itemPromises = Object.entries(kanban_items)?.map(
						([id_item, {id: idItemKanban, id_sppb_in, ...restItemKanban}]) => {
							if (id_sppb_in !== rest.id_sppb_in) return null;

							return OrmKanbanItem.upsert(
								{
									...restItemKanban,
									id_item,
									id: idItemKanban ?? generateId('KNBI_'),
									id_mesin: rest.list_mesin[id_item]!?.[0]!,
									id_kanban: createdKanban.dataValues.id,
								},
								{transaction},
							);
						},
					);

					await Promise.all(itemPromises);

					await transaction.commit();
					return Success;
				} catch (err) {
					await transaction.rollback();
					if (err instanceof TRPCError) throw new TRPCError(err);
					throw new TRPCError({code: 'BAD_REQUEST'});
				}
			});
		}),
};
