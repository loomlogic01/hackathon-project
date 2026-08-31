import React from "react";

/**
 * Generic table.
 * columns: [{ key, header, render?: (row) => node, className? }]
 * rows: array of objects
 */
export default function DataTable({ columns, rows, keyField = "id", emptyMessage = "No records found." }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="py-14 text-center text-sm text-slate-500 bg-white rounded-lg border border-slate-200">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-slate-200 shadow-card">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row[keyField]} className="hover:bg-slate-50/70 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3.5 text-sm text-slate-700 align-middle ${col.className || ""}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
