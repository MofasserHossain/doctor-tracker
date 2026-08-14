export type ServiceResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
};

export type CursorPaginationMeta = {
  limit: number;
  nextCursor: string | null;
  hasNextPage: boolean;
};

export type PaginatedResult<T> = {
  records: T[];
  meta: CursorPaginationMeta;
};
