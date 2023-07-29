import { Brackets } from 'typeorm'
import { Field, InputType } from 'type-graphql'
import { FilterHandler, FilterQueries, queueWheres, subWhere } from './helpers'

@InputType()
export class NumberFilterInput {
	@Field((type) => [NumberFilterInput], { nullable: true })
	and?: NumberFilterInput[]

	@Field((type) => [NumberFilterInput], { nullable: true })
	or?: NumberFilterInput[]

	@Field({ nullable: true })
	eq?: Number

	@Field({ nullable: true })
	neq?: Number;

	@Field((type) => [Number], { nullable: true })
	in?: Number[]

	@Field((type) => [Number], { nullable: true })
	nin?: Number[]

	@Field({ nullable: true })
	gt?: Number

	@Field({ nullable: true })
	gte?: Number

	@Field({ nullable: true })
	lt?: Number

	@Field({ nullable: true })
	lte?: Number

	@Field({ nullable: true })
	isNull?: Boolean

	@Field({ nullable: true })
	isNotNull?: Boolean
}

export const handleNumberFilter: FilterHandler<NumberFilterInput> = (
	field,
	filter,
	query,
	op
) => {
	let queries: FilterQueries = []

	if (filter.and)
		queries.push(
			new Brackets(
				subWhere(handleNumberFilter, field, filter.and, 'andWhere')
			)
		)
	if (filter.or)
		queries.push(
			new Brackets(
				subWhere(handleNumberFilter, field, filter.or, 'orWhere')
			)
		)

	if (filter.eq)
		queries.push([`${field} = :${field}`, { [field]: filter.eq }])
	if (filter.neq)
		queries.push([`${field} != :${field}`, { [field]: filter.neq }])
	if (filter.in)
		queries.push([`${field} IN (:...${field})`, { [field]: filter.in }])
	if (filter.nin)
		queries.push([
			`${field} NOT IN (:...${field})`,
			{ [field]: filter.nin },
		])
	if (filter.gt)
		queries.push([`${field} > :${field}`, { [field]: filter.gt }])
	if (filter.gte)
		queries.push([`${field} >= :${field}`, { [field]: filter.gte }])
	if (filter.lt)
		queries.push([`${field} < :${field}`, { [field]: filter.lt }])
	if (filter.lte)
		queries.push([`${field} <= :${field}`, { [field]: filter.lte }])
	if (filter.isNull) queries.push([`${field} IS NULL`, undefined])
	if (filter.isNotNull) queries.push([`${field} IS NOT NULL`, undefined])

	return queueWheres(queries, query, op)
}
