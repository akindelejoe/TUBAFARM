import { Pagination as PaginationType } from "../types";

export function Pagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationType;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm">
      <span className="text-gray-500">
        Page {pagination.page} of {pagination.totalPages} &middot; {pagination.total} total
      </span>
      <div className="flex gap-2">
        <button
          className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          className="rounded-md border border-gray-300 px-3 py-1 disabled:opacity-40"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
