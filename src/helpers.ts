import {
	Brackets,
	ObjectLiteral,
	SelectQueryBuilder,
	WhereExpressionBuilder,
} from 'typeorm'

export type FilterOp = 'andWhere' | 'orWhere'

export type FilterHandler<TFilter extends {}> = <
	TModel extends {},
	TBuilder extends SelectQueryBuilder<TModel> | WhereExpressionBuilder
>(
	field: string,
	filter: TFilter,
	query: TBuilder,
	op?: FilterOp
) => TBuilder

export type FilterQueries = ([string, ObjectLiteral | undefined] | Brackets)[]

export const subWhere = <TFilter extends {}>(
	handler: FilterHandler<TFilter>,
	field: string,
	filter: TFilter[],
	op?: FilterOp
) => {
	return (qb: WhereExpressionBuilder) => {
		for (let i = 0; i < (filter.length || 0); i++) {
			const tfilter = filter[i]
			if (tfilter) handler(field, tfilter, qb, i === 0 ? undefined : op)
		}
	}
}

export const queueWheres = <
	TModel extends {},
	TBuilder extends SelectQueryBuilder<TModel> | WhereExpressionBuilder
>(
	queries: FilterQueries,
	query: TBuilder,
	op?: FilterOp
) => {
	let q = query

	for (let i = 0; i < queries.length; i++) {
		const tuple = queries[i]
		const fn: 'where' | FilterOp =
			op === undefined ? (i === 0 ? 'where' : 'andWhere') : op

		if (tuple instanceof Brackets) {
			q = q[fn](tuple) as TBuilder
		} else {
			if (tuple) {
				const [query, params] = tuple
				q = q[fn](query, params) as TBuilder
			}
		}
	}

	return q
}
