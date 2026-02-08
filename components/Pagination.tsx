"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  count: number;
  onPageChange: (page: number) => void;
  loading: boolean;
}

export default function Pagination({
  page,
  totalPages,
  count,
  onPageChange,
  loading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || loading}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700 disabled:hover:bg-gray-800 transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-gray-400">
        Page {page} of {totalPages} ({count.toLocaleString()} games)
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || loading}
        className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-700 disabled:hover:bg-gray-800 transition-colors"
      >
        Next
      </button>
    </div>
  );
}
