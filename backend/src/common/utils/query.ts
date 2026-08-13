export type PaginationOptions = {
  page?: number | string;
  limit?: number | string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export const getPagination = (options: PaginationOptions) => {
  const page = Math.max(Number(options.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(options.limit ?? 10), 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const createPaginationMeta = (options: { page: number; limit: number; total: number }): PaginationMeta => {
  const totalPages = Math.max(Math.ceil(options.total / options.limit), 1);

  return {
    page: options.page,
    limit: options.limit,
    total: options.total,
    totalPages,
    hasNextPage: options.page < totalPages,
    hasPreviousPage: options.page > 1,
  };
};

export const getDateRangeFilter = (from?: string, to?: string) => {
  if (!from && !to) return undefined;

  const range: { $gte?: Date; $lte?: Date } = {};

  if (from) {
    range.$gte = new Date(`${from}T00:00:00.000Z`);
  }

  if (to) {
    range.$lte = new Date(`${to}T23:59:59.999Z`);
  }

  return range;
};
