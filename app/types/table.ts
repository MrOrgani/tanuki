export interface Pagination {
  page: number;
  perPage: number;
}

export interface FullPagination extends Pagination {
  totalCount: number;
}

export type SortValues = 'asc' | 'desc';
