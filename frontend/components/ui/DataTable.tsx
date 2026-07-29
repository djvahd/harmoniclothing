import { Fragment, type ReactNode } from "react";
import clsx from "clsx";
import { TableRowsSkeleton } from "@/components/ui/LoadingState";

export interface DataTableColumn {
  key: string;
  header: ReactNode;
  className?: string;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyState,
  renderRow,
  getRowKey,
}: {
  columns: DataTableColumn[];
  data: T[];
  isLoading: boolean;
  emptyState: ReactNode;
  renderRow: (item: T) => ReactNode;
  getRowKey: (item: T) => string | number;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface">
      <table className="w-full text-left font-body text-sm">
        <thead className="border-b border-border text-text-secondary">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={clsx("p-4", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && <TableRowsSkeleton columns={columns.length} />}
          {!isLoading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {emptyState}
              </td>
            </tr>
          )}
          {!isLoading &&
            data.map((item) => <Fragment key={getRowKey(item)}>{renderRow(item)}</Fragment>)}
        </tbody>
      </table>
    </div>
  );
}
