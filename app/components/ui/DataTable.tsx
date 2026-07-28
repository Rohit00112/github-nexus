"use client";

import { cn } from "../../lib/cn";
import Checkbox from "./Checkbox";
import { SkeletonRows } from "./Skeleton";

export interface Column<T> {
  /** Stable identifier, also used as the React key. */
  id: string;
  header: React.ReactNode;
  cell: (row: T) => React.ReactNode;
  /** Tailwind width utility, e.g. `w-32`. Omit to size by content. */
  width?: string;
  align?: "left" | "right" | "center";
  /** Hidden below the md breakpoint. Use for secondary metadata. */
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  /** Must be stable across renders — used for keys and selection. */
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  /** Enables the leading checkbox column when provided. */
  selection?: {
    selected: Set<string>;
    onChange: (selected: Set<string>) => void;
  };
  loading?: boolean;
  /** Shown when `rows` is empty and not loading. */
  empty?: React.ReactNode;
  className?: string;
  /** Index of the keyboard-focused row, for j/k navigation. */
  activeIndex?: number;
}

export default function DataTable<T>({
  rows,
  columns,
  rowKey,
  onRowClick,
  selection,
  loading,
  empty,
  className,
  activeIndex,
}: DataTableProps<T>) {
  if (loading) return <SkeletonRows rows={8} className={className} />;
  if (rows.length === 0 && empty) return <>{empty}</>;

  const keys = rows.map(rowKey);
  const allSelected = selection ? keys.length > 0 && keys.every((k) => selection.selected.has(k)) : false;
  const someSelected = selection ? keys.some((k) => selection.selected.has(k)) : false;

  const toggleAll = () => {
    if (!selection) return;
    selection.onChange(allSelected ? new Set() : new Set(keys));
  };

  const toggleRow = (key: string) => {
    if (!selection) return;
    const next = new Set(selection.selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selection.onChange(next);
  };

  const alignment = (align?: Column<T>["align"]) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-border">
              {selection && (
                <th className="w-9 px-3 py-2">
                  <Checkbox
                    aria-label="Select all rows"
                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                    onCheckedChange={toggleAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={cn(
                    "px-3 py-2 text-2xs font-medium uppercase tracking-wider text-text-subtle",
                    alignment(column.align),
                    column.width,
                    column.hideOnMobile && "hidden md:table-cell"
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const key = rowKey(row);
              const isSelected = selection?.selected.has(key) ?? false;
              return (
                <tr
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  data-active={activeIndex === index || undefined}
                  className={cn(
                    "border-b border-border last:border-0",
                    onRowClick && "cursor-pointer",
                    isSelected ? "bg-accent-muted" : "hover:bg-surface-hover",
                    activeIndex === index && "ring-1 ring-inset ring-accent"
                  )}
                >
                  {selection && (
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label="Select row"
                        checked={isSelected}
                        onCheckedChange={() => toggleRow(key)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        "px-3 py-2.5 text-sm text-text-muted",
                        alignment(column.align),
                        column.hideOnMobile && "hidden md:table-cell"
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
