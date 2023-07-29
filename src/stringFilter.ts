import { Brackets } from 'typeorm'
import { Field, InputType } from 'type-graphql'
import { FilterHandler, FilterQueries, queueWheres, subWhere } from './helpers'

@InputType()
export class StringFilterInput {
	@Field((type) => [StringFilterInput], { nullable: true })
	and?: StringFilterInput[]

	@Field((type) => [StringFilterInput], { nullable: true })
	or?: StringFilterInput[]

	@Field((type) => String, { nullable: true })
	eq?: String

	@Field((type) => String, { nullable: true })
	neq?: String

	@Field((type) => String, { nullable: true })
	contains?: String

	@Field((type) => String, { nullable: true })
	ncontains?: String;

	@Field((type) => [String], { nullable: true })
	in?: String[]

	@Field((type) => [String], { nullable: true })
	nin?: String[]

	@Field((type) => String, { nullable: true })
	startsWith?: String

	@Field((type) => String, { nullable: true })
	nstartsWith?: String

	@Field((type) => String, { nullable: true })
	endsWith?: String

	@Field((type) => String, { nullable: true })
	nendsWith?: String

	@Field((type) => Boolean, { nullable: true })
	isNull?: Boolean

	@Field((type) => Boolean, { nullable: true })
	isNotNull?: Boolean
}

export const handleStringFilter: FilterHandler<StringFilterInput> = (
	field,
	filter,
	query,
	op
) => {
	let queries: FilterQueries = []

	if (filter.and)
		queries.push(
			new Brackets(
				subWhere(handleStringFilter, field, filter.and, 'andWhere')
			)
		)
	if (filter.or)
		queries.push(
			new Brackets(
				subWhere(handleStringFilter, field, filter.or, 'orWhere')
			)
		)

	if (filter.eq !== undefined)
		queries.push([`${field} = :eq`, { eq: filter.eq }])
	if (filter.neq !== undefined)
		queries.push([`${field} != :neq`, { neq: filter.neq }])
	if (filter.contains !== undefined)
		queries.push([
			`${field} LIKE :contains`,
			{ contains: `%${filter.contains}%` },
		])
	if (filter.ncontains !== undefined)
		queries.push([
			`${field} NOT LIKE :ncontains`,
			{ ncontains: `%${filter.ncontains}%` },
		])
	if (filter.in !== undefined)
		queries.push([`${field} IN (:...in)`, { in: filter.in }])
	if (filter.nin !== undefined)
		queries.push([`${field} NOT IN (:...nin)`, { nin: filter.nin }])
	if (filter.startsWith !== undefined)
		queries.push([
			`${field} LIKE :startsWith`,
			{ startsWith: `${filter.startsWith}%` },
		])
	if (filter.nstartsWith !== undefined)
		queries.push([
			`${field} NOT LIKE :nstartsWith`,
			{ nstartsWith: `${filter.nstartsWith}%` },
		])
	if (filter.endsWith !== undefined)
		queries.push([
			`${field} LIKE :endsWith`,
			{ endsWith: `%${filter.endsWith}` },
		])
	if (filter.nendsWith !== undefined)
		queries.push([
			`${field} NOT LIKE :nendsWith`,
			{ nendsWith: `%${filter.nendsWith}` },
		])
	if (filter.isNull !== undefined)
		queries.push([`${field} IS NULL`, undefined])
	if (filter.isNotNull !== undefined)
		queries.push([`${field} IS NOT NULL`, undefined])

	return queueWheres(queries, query, op)
}
