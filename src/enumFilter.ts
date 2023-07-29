import { Brackets, SelectQueryBuilder, WhereExpressionBuilder } from 'typeorm'
import { Field, InputType } from 'type-graphql'

@InputType()
export class EnumFilterInput {
	@Field((type) => [EnumFilterInput], { nullable: true })
	and?: EnumFilterInput[]

	@Field((type) => [EnumFilterInput], { nullable: true })
	or?: EnumFilterInput[]

	@Field({ nullable: true })
	eq?: String

	@Field({ nullable: true })
	neq?: String;

	@Field((type) => [String], { nullable: true })
	in?: String[]

	@Field((type) => [String], { nullable: true })
	nin?: String[]
}

export const handleEnumFilter = <
	TModel extends {},
	TBuilder extends SelectQueryBuilder<TModel> | WhereExpressionBuilder
>(
	field: string,
	filter: EnumFilterInput,
	query: TBuilder
): TBuilder => {
	let q = query

	if (filter.and) {
		q = q.andWhere(
			new Brackets((qb) => {
				for (let subfilter of filter.and!)
					qb = handleEnumFilter(field, subfilter, qb)
				return qb
			})
		) as TBuilder
	}

	if (filter.or) {
		q = q.orWhere(
			new Brackets((qb) => {
				for (let subfilter of filter.or!)
					qb = handleEnumFilter(field, subfilter, qb)
				return qb
			})
		) as TBuilder
	}

	if (filter.eq) {
		q = q.where(`${field} = :${field}`, { [field]: filter.eq }) as TBuilder
	}
	if (filter.neq) {
		q = q.where(`${field} != :${field}`, {
			[field]: filter.neq,
		}) as TBuilder
	}
	if (filter.in) {
		q = q.where(`${field} IN (:...${field})`, {
			[field]: filter.in,
		}) as TBuilder
	}
	if (filter.nin) {
		q = q.where(`${field} NOT IN (:...${field})`, {
			[field]: filter.nin,
		}) as TBuilder
	}

	return q
}
