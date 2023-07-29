import { Brackets } from 'typeorm'
import { Field, InputType } from 'type-graphql'
import { FilterHandler, FilterQueries, queueWheres, subWhere } from './helpers'

@InputType()
export class BooleanFilterInput {
	@Field((type) => [BooleanFilterInput], { nullable: true })
	and?: BooleanFilterInput[]

	@Field((type) => [BooleanFilterInput], { nullable: true })
	or?: BooleanFilterInput[]

	@Field((type) => Boolean, { nullable: true })
	eq?: Boolean

	@Field((type) => Boolean, { nullable: true })
	neq?: Boolean

	@Field((type) => Boolean, { nullable: true })
	isNull?: Boolean

	@Field((type) => Boolean, { nullable: true })
	isNotNull?: Boolean
}

export const handleBooleanFilter: FilterHandler<BooleanFilterInput> = (
	field,
	filter,
	query,
	op
) => {
	let queries: FilterQueries = []

	if (filter.and)
		queries.push(
			new Brackets(
				subWhere(handleBooleanFilter, field, filter.and, 'andWhere')
			)
		)
	if (filter.or)
		queries.push(
			new Brackets(
				subWhere(handleBooleanFilter, field, filter.or, 'orWhere')
			)
		)

	if (filter.eq !== undefined)
		queries.push([`${field} = :${field}`, { [field]: filter.eq }])
	if (filter.neq !== undefined)
		queries.push([`${field} != :${field}`, { [field]: filter.neq }])
	if (filter.isNull !== undefined)
		queries.push([`${field} IS NULL`, undefined])
	if (filter.isNotNull !== undefined)
		queries.push([`${field} IS NOT NULL`, undefined])

	return queueWheres(queries, query, op)
}
