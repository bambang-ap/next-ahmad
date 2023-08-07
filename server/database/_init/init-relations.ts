import {Model, ModelStatic} from "sequelize";

import {
	OrmCustomer,
	OrmCustomerPO,
	OrmCustomerPOItem,
	OrmCustomerSPPBOut,
	OrmDocument,
	OrmHardness,
	OrmHardnessKategori,
	OrmKanban,
	OrmKanbanItem,
	OrmKategoriMesin,
	OrmKendaraan,
	OrmMasterItem,
	OrmMaterial,
	OrmMaterialKategori,
	OrmMesin,
	OrmParameter,
	OrmParameterKategori,
	OrmPOItemSppbIn,
	OrmSupItemRelation,
	OrmSupplier,
	OrmSupplierItem,
	OrmSupplierPO,
	OrmSupplierPOItem,
	OrmUser,
} from "@database";

function oneToMany<M extends object, B extends object>(
	sourceOrm: ModelStatic<Model<M>>,
	targetOrm: ModelStatic<Model<B>>,
	sourceForeignKey: keyof M | [foreignKey: keyof M, alias: string][],
	targetForeignKey: keyof B | [foreignKey: keyof B, alias: string][],
	alias?: string,
) {
	function hasMany(foreignKey: string, as?: string) {
		sourceOrm.hasMany(targetOrm, {as, foreignKey});
	}
	function belongsTo(foreignKey: string, as?: string) {
		targetOrm.belongsTo(sourceOrm, {as, foreignKey});
	}

	if (Array.isArray(sourceForeignKey)) {
		sourceForeignKey.forEach(([foreignKey, as]) => {
			hasMany(foreignKey as string, as);
		});
	} else hasMany(sourceForeignKey as string, alias);

	if (Array.isArray(targetForeignKey)) {
		targetForeignKey.forEach(([foreignKey, as]) => {
			belongsTo(foreignKey as string, as);
		});
	} else belongsTo(sourceForeignKey as string, alias);
}

export function initRelations() {
	oneToMany(OrmMasterItem, OrmCustomerPOItem, "id", "master_item_id");
	oneToMany(OrmMasterItem, OrmKanbanItem, "id", "master_item_id");
	oneToMany(OrmKategoriMesin, OrmMasterItem, "id", "kategori_mesin");
	oneToMany(
		OrmKategoriMesin,
		OrmMesin,
		"id",
		"kategori_mesin",
		OrmKategoriMesin._alias,
	);
	oneToMany(OrmCustomer, OrmCustomerPO, "id", "id_customer");
	oneToMany(OrmCustomer, OrmCustomerSPPBOut, "id", "id_customer");
	oneToMany(OrmKendaraan, OrmCustomerSPPBOut, "id", "id_kendaraan");
	oneToMany(OrmCustomerPO, OrmKanban, "id", "id_po");
	oneToMany(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "id_item");
	oneToMany(OrmPOItemSppbIn, OrmKanbanItem, "id", "id_item");
	oneToMany(OrmDocument, OrmKanban, "id", "doc_id");
	oneToMany(OrmUser, OrmKanban, "id", [
		["createdBy", OrmKanban._aliasCreatedBy],
		["updatedBy", OrmKanban._aliasUpdatedBy],
	]);
	// relation(OrmCustomerPOItem, OrmPOItemSppbIn, "id", "kategori_mesin");

	// oneToMany(OrmSupplier, OrmSupplierItem, "id", "id_supplier");
	oneToMany(OrmSupplierPO, OrmSupplierPOItem, "id_po", "id");
	oneToMany(OrmSupItemRelation, OrmSupplierPOItem, "id_supplier_item", "id");

	oneToMany(OrmHardnessKategori, OrmHardness, "id", "id_kategori");
	oneToMany(OrmMaterialKategori, OrmMaterial, "id", "id_kategori");
	oneToMany(OrmParameterKategori, OrmParameter, "id", "id_kategori");

	manyToMany(
		[OrmSupplier, "id"],
		[OrmSupplierItem, "id"],
		[OrmSupItemRelation, ["supplier_id", "item_id"]],
	);
}

type OO<T extends {}> = [model: ModelStatic<Model<T>>, foreignKey: ObjKeyof<T>];
type OG<T extends {}> = [
	model: ModelStatic<Model<T>>,
	foreignKey: [throughFKSource: ObjKeyof<T>, throughFKTarget: ObjKeyof<T>],
];
function manyToMany<A extends {}, B extends {}, C extends {}>(
	source: OO<A>,
	target: OO<B>,
	through: OG<C>,
) {
	const [sourceModel, sourceFK] = source;
	const [targetModel, targetFK] = target;
	const [throughModel, [throughFKSource, throughFKTarget]] = through;

	sourceModel.belongsToMany(targetModel, {
		through: throughModel,
		// as: targetModel._alias,
		foreignKey: throughFKSource,
	});
	targetModel.belongsToMany(sourceModel, {
		through: throughModel,
		// as: sourceModel._alias,
		foreignKey: throughFKTarget,
	});
	throughModel.belongsTo(sourceModel, {
		foreignKey: throughFKSource,
	});
	sourceModel.belongsTo(throughModel, {
		foreignKey: sourceFK,
	});
	throughModel.belongsTo(targetModel, {
		foreignKey: throughFKTarget,
	});
	OrmSupplierItem.belongsTo(throughModel, {
		foreignKey: targetFK,
	});
}

// OrmSupplier.belongsToMany(OrmSupplierItem, {
// 	through: OrmSupItemRelation,
// 	as: OrmSupplierItem._alias,
// 	foreignKey: "supplier_id" as keyof TSupItemRelation,
// });
// OrmSupplierItem.belongsToMany(OrmSupplier, {
// 	through: OrmSupItemRelation,
// 	as: OrmSupplier._alias,
// 	foreignKey: "item_id" as keyof TSupItemRelation,
// });
// OrmSupItemRelation.belongsTo(OrmSupplier, {
// 	foreignKey: "supplier_id" as keyof TSupItemRelation,
// });
// OrmSupplier.belongsTo(OrmSupItemRelation, {
// 	foreignKey: "id" as keyof TSupplier,
// });
// OrmSupItemRelation.belongsTo(OrmSupplierItem, {
// 	foreignKey: "item_id" as keyof TSupItemRelation,
// });
// OrmSupplierItem.belongsTo(OrmSupItemRelation, {
// 	foreignKey: "id" as keyof TSupplier,
// });
