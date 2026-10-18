import { Children, cloneElement, Fragment, isValidElement, type ReactElement, type ReactNode } from "react";
import clsx from "clsx";
import { TableRowsSkeleton } from "@/components/ui/LoadingState";

export interface DataTableColumn {
  key: string;
  header: ReactNode;
  className?: string;
}

/** Tags each <td> of a rendered <tr> with its column header, so the mobile card layout can label it. */
function labelCells(node: ReactNode, columns: DataTableColumn[]): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const el = child as ReactElement<{ children?: ReactNode }>;
    if (el.type === Fragment) return cloneElement(el, {}, labelCells(el.props.children, columns));
    if (el.type !== "tr") return child;
    let i = 0;
    return cloneElement(
      el,
      {},
      Children.map(el.props.children, (cell) => {
        if (!isValidElement(cell) || cell.type !== "td") return cell;
        const header = columns[i++]?.header;
        return typeof header === "string" ? cloneElement(cell as ReactElement<Record<string, unknown>>, { "data-label": header }) : cell;
      }),
    );
  });
}

/** Generic admin list table: column defs + row renderer, with built-in loading skeleton and empty state. Rows stack as cards below md. */
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
      <table className="data-table-stack w-full text-left font-body text-sm">
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
            data.map((item) => (
              <Fragment key={getRowKey(item)}>{labelCells(renderRow(item), columns)}</Fragment>
            ))}
        </tbody>
      </table>
    </div>
  );
}
