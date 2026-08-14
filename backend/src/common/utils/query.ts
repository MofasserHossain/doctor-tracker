export type CursorPaginationOptions = {
  cursor?: string;
  limit?: number | string;
};

export type CursorPaginationMeta = {
  limit: number;
  nextCursor: string | null;
  hasNextPage: boolean;
};

type CursorRecord = { _id: unknown };

export const getCursorPagination = (options: CursorPaginationOptions) => {
  const limit = Math.min(Math.max(Number(options.limit ?? 10), 1), 100);
  const cursor = options.cursor;

  return { cursor, limit };
};

const createCursorPaginationMeta = (options: {
  limit: number;
  hasNextPage: boolean;
  nextCursor: string | null;
}): CursorPaginationMeta => {
  return {
    limit: options.limit,
    nextCursor: options.nextCursor,
    hasNextPage: options.hasNextPage,
  };
};

const createNextCursor = (record: CursorRecord) => {
  return String(record._id);
};

export const createCursorPage = <T extends CursorRecord>(records: T[], limit: number) => {
  const hasNextPage = records.length > limit;
  const pageRecords = hasNextPage ? records.slice(0, limit) : records;
  const lastRecord = pageRecords.at(-1);

  return {
    records: pageRecords,
    meta: createCursorPaginationMeta({
      limit,
      hasNextPage,
      nextCursor: hasNextPage && lastRecord ? createNextCursor(lastRecord) : null,
    }),
  };
};

export const getDateRangeFilter = (from?: string, to?: string) => {
  if (!from && !to) {
    return undefined;
  }

  const range: { $gte?: Date; $lte?: Date } = {};

  if (from) {
    range.$gte = new Date(`${from}T00:00:00.000Z`);
  }

  if (to) {
    range.$lte = new Date(`${to}T23:59:59.999Z`);
  }

  return range;
};

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const createPartialMatchRegex = (value: string) => {
  return new RegExp(escapeRegExp(value.trim()), "i");
};
