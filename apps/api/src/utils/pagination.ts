export function getPagination(page: number, limit: number) {
  const take = limit;
  const skip = (page - 1) * limit;

  return { skip, take };
}

export function paginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
}
