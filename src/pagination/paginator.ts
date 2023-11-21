import { SelectQueryBuilder } from "typeorm";

export interface PaginateOptions {
  limit: number;
  currentPage: number;
  total?: boolean;
}

export interface PaginationResult<T> {
  first: number;
  last: number;
  limit: number;
  total?: number;
  data: T[]
}
export interface EmptyPaginationResult<T> {
  data: T[],
  message: string;
}

export async function paginate<T>(
  qb: SelectQueryBuilder<T>,
  options: PaginateOptions = {
    limit: 10,
    currentPage: 1
  }
): Promise<PaginationResult<T> | EmptyPaginationResult<T>> {
  const offset = (options.currentPage - 1) * options.limit;

  const data = await qb.limit(options.limit).offset(offset).getMany();

  if(data.length === 0) {
    return {
      data,
      message: "Nothing found"
    }
  }

  return {
    first: offset + 1,
    last: offset + data.length,
    limit: options.limit,
    total: options.total ? await qb.getCount() : null,
    data
  }
}