import { GT, GTE, LT, LTE } from './consts'

export const comparisonToSymbol = (data: 'lt' | 'lte' | 'gt' | 'gte') => {
  switch (data) {
    case 'lt':
      return LT

    case 'lte':
      return LTE

    case 'gt':
      return GT

    case 'gte':
      return GTE

    default:
      return null
  }
}

export const symbolToOperation = (data: symbol) => {
  switch (data) {
    case LT:
      return '<'

    case LTE:
      return '<='

    case GT:
      return '>'

    case GTE:
      return '>='

    default:
      return null
  }
}
