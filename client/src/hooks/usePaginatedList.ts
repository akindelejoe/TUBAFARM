import { useCallback, useEffect, useState } from "react";
import { ApiListResponse, Pagination } from "../types";
import { getErrorMessage } from "../services/api";

export function usePaginatedList<T>(
  fetcher: (params: Record<string, unknown>) => Promise<ApiListResponse<T>>,
  extraParams: Record<string, unknown> = {}
) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, pageSize: 20, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const extraKey = JSON.stringify(extraParams);

  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetcher({ page, pageSize: 20, ...JSON.parse(extraKey) })
      .then((res) => {
        setItems(res.data);
        setPagination(res.pagination);
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, extraKey, reloadToken]);

  return { items, pagination, page, setPage, loading, error, reload };
}
