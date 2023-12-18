import {getPOScoreAttributes} from './attributes';

export async function getPoScore(id: string) {
	const {po, poItem, inItem, outItem} = getPOScoreAttributes();

	const data = await po.model.findOne({
		where: {id},
		attributes: po.attributes,
		include: [{...poItem, include: [{...inItem, include: [outItem]}]}],
	});

	return data?.toJSON();
}
