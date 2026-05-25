import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function columnAlignClass(
  idx: number,
  centerColumns: number[] | undefined,
  leftColumns: number[] | undefined,
  centerAllColumns: boolean | undefined
): string {
  if (leftColumns?.includes(idx)) return "text-left pl-0";
  if (centerAllColumns || centerColumns?.includes(idx)) return "text-center";
  return "text-center";
}

export function DataTable({
  title,
  headers,
  rows,
  centerColumns,
  leftColumns,
  centerAllColumns
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
  /** Column indices (0-based) whose header and cells are horizontally centered */
  centerColumns?: number[];
  /** Column indices (0-based) whose header and cells are left-aligned (e.g. first column) */
  leftColumns?: number[];
  /** When true, every column is centered */
  centerAllColumns?: boolean;
}) {
  const align = (idx: number) => columnAlignClass(idx, centerColumns, leftColumns, centerAllColumns);

  return (
    <Card>
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {headers.map((header, headerIdx) => (
                <th
                  key={`${header}-${headerIdx}`}
                  className={cn("px-2 py-3 font-bold align-middle", align(headerIdx))}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border last:border-0">
                {row.map((cell, idx) => (
                  <td key={idx} className={cn("px-2 py-3 align-middle", align(idx))}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
