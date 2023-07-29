import { SelectQueryBuilder } from 'typeorm'
import { StringFilterInput, handleStringFilter } from './stringFilter'
import { NumberFilterInput, handleNumberFilter } from './numberFilter'
import { BooleanFilterInput, handleBooleanFilter } from './booleanFilter'

export const handleSearch = <TModel extends {}>(
	search: unknown,
	query: SelectQueryBuilder<TModel>
): SelectQueryBuilder<TModel> => {
	if (!search) return query

	let q = query

	for (let field in search) {
		const filter: unknown = search[field as keyof typeof search]

		if (filter instanceof StringFilterInput) {
			q = handleStringFilter(field, filter, q)
		} else if (filter instanceof NumberFilterInput) {
			q = handleNumberFilter(field, filter, q)
		} else if (filter instanceof BooleanFilterInput) {
			q = handleBooleanFilter(field, filter, q)
		}
	}

	return q
}

export { StringFilterInput, NumberFilterInput, BooleanFilterInput }
