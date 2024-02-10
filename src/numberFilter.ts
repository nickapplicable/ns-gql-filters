import { Brackets } from 'typeorm'
import { Field, InputType } from 'type-graphql'
import { FilterHandler, FilterQueries, queueWheres, subWhere } from './helpers'

@InputType()
export class NumberFilterInput {
	@Field((type) => [NumberFilterInput], { nullable: true })
	and?: NumberFilterInput[]

	@Field((type) => [NumberFilterInput], { nullable: true })
	or?: NumberFilterInput[]

	@Field((type) => Number, { nullable: true })
	eq?: Number

	@Field((type) => Number, { nullable: true })
	neq?: Number;

	@Field((type) => [Number], { nullable: true })
	in?: Number[]

	@Field((type) => [Number], { nullable: true })
	nin?: Number[]

	@Field((type) => Number, { nullable: true })
	gt?: Number

	@Field((type) => Number, { nullable: true })
	gte?: Number

	@Field((type) => Number, { nullable: true })
	lt?: Number

	@Field((type) => Number, { nullable: true })
	lte?: Number

	@Field((type) => Boolean, { nullable: true })
	isNull?: Boolean

	@Field((type) => Boolean, { nullable: true })
	isNotNull?: Boolean
}

export const handleNumberFilter: FilterHandler<NumberFilterInput> = (
	field,
	filter,
	query,
	op
) => {
	let queries: FilterQueries = []

	const id = Math.random().toString(36).substring(7)

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
		queries.push([`${field} = :eq_${id}`, { [`eq_${id}`]: filter.eq }])
	if (filter.neq)
		queries.push([`${field} != :neq_${id}`, { [`neq_${id}`]: filter.neq }])
	if (filter.in)
		queries.push([
			`${field} IN (:...in_${id})`,
			{ [`in_${id}`]: filter.in },
		])
	if (filter.nin)
		queries.push([
			`${field} NOT IN (:...nin_${id})`,
			{ [`nin_${id}`]: filter.nin },
		])
	if (filter.gt)
		queries.push([`${field} > :gt_${id}`, { [`gt_${id}`]: filter.gt }])
	if (filter.gte)
		queries.push([`${field} >= :gte_${id}`, { [`gte_${id}`]: filter.gte }])
	if (filter.lt)
		queries.push([`${field} < :lt_${id}`, { [`lt_${id}`]: filter.lt }])
	if (filter.lte)
		queries.push([`${field} <= :lte_${id}`, { [`lte_${id}`]: filter.lte }])
	if (filter.isNull) queries.push([`${field} IS NULL`, undefined])
	if (filter.isNotNull) queries.push([`${field} IS NOT NULL`, undefined])

	return queueWheres(queries, query, op)
}
