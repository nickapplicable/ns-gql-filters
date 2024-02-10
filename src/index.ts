import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from 'typeorm'
import { StringFilterInput, handleStringFilter } from './stringFilter'
import { NumberFilterInput, handleNumberFilter } from './numberFilter'
import { BooleanFilterInput, handleBooleanFilter } from './booleanFilter'
import { queueWheres } from './helpers'

export const handleSearch = <TModel extends {}>(
	search: unknown,
	query: SelectQueryBuilder<TModel>
): SelectQueryBuilder<TModel> => {
	if (!search) return query
	return handleFilters(search, query) as SelectQueryBuilder<TModel>
}

const handleFilters = <TModel extends {}>(
	search: unknown,
	query: SelectQueryBuilder<TModel> | WhereExpressionBuilder
): SelectQueryBuilder<TModel> | WhereExpressionBuilder => {
	if (!search) return query

	let q = query

	const entries = Object.entries(search)

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i]
		if (!entry) continue
		const [field, filter] = entry

		if (filter instanceof StringFilterInput) {
			q = handleStringFilter(field, filter, q)
		} else if (filter instanceof NumberFilterInput) {
			q = handleNumberFilter(field, filter, q)
		} else if (filter instanceof BooleanFilterInput) {
			q = handleBooleanFilter(field, filter, q)
		} else if (field === 'and') {
			for (let j = 0; j < (filter as unknown[]).length; j++) {
				const fn = i === 0 && j === 0 ? 'where' : 'andWhere'
				q = q?.[fn](new Brackets((qb) => handleFilters(filter[j], qb)))
			}
		} else if (field === 'or') {
			for (let j = 0; j < (filter as unknown[]).length; j++) {
				const fn = i === 0 && j === 0 ? 'where' : 'orWhere'
				q = q?.[fn](new Brackets((qb) => handleFilters(filter[j], qb)))
			}
		}
	}

	return q
}

export { StringFilterInput, NumberFilterInput, BooleanFilterInput }
