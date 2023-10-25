import {Model, ModelStatic} from 'sequelize';

type OO<T extends {}> = [model: ModelStatic<Model<T>>, foreignKey: ObjKeyof<T>];
type OG<T extends {}> = [
	model: ModelStatic<Model<T>>,
	foreignKey: [throughFKSource: ObjKeyof<T>, throughFKTarget: ObjKeyof<T>],
];

export function manyToMany<A extends {}, B extends {}, C extends {}>(
	source: OO<A>,
	target: OO<B>,
	through: OG<C>,
) {
	const [sourceModel, sourceFK] = source;
	const [targetModel, targetFK] = target;
	const [throughModel, [throughFKSource, throughFKTarget]] = through;

	sourceModel.belongsToMany(targetModel, {
		through: throughModel,
		foreignKey: throughFKSource,
	});
	targetModel.belongsToMany(sourceModel, {
		through: throughModel,
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
	targetModel.belongsTo(throughModel, {
		foreignKey: targetFK,
	});
}

export function oneToMany<M extends object, B extends object>(
	sourceOrm: ModelStatic<Model<M>>,
	targetOrm: ModelStatic<Model<B>>,
	foreignKey: ObjKeyof<B>,
	alias?: string,
) {
	sourceOrm.hasMany(targetOrm, {foreignKey});
	targetOrm.belongsTo(sourceOrm, {foreignKey, as: alias});
}

export function oneToOne<M extends object, B extends object>(
	sourceOrm: ModelStatic<Model<M>>,
	targetOrm: ModelStatic<Model<B>>,
	foreignKey: ObjKeyof<B>,
	alias?: string,
) {
	sourceOrm.hasOne(targetOrm, {foreignKey});
	targetOrm.belongsTo(sourceOrm, {foreignKey, as: alias});
}
