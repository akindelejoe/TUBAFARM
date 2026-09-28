import { useState } from "react";
import { SelectInput } from "../components/SelectInput";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { api, getErrorMessage } from "../services/api";
import { formatCurrency } from "../utils/format";

type ReportKey = "production" | "sales" | "inventory" | "expenses" | "profit-loss" | "tree-productivity" | "customer-sales";

const REPORT_OPTIONS: { value: ReportKey; label: string }[] = [
  { value: "production", label: "Production Report" },
  { value: "sales", label: "Sales Report" },
  { value: "inventory", label: "Inventory Report" },
  { value: "expenses", label: "Expense Report" },
  { value: "profit-loss", label: "Profit / Loss Summary" },
  { value: "tree-productivity", label: "Tree Productivity Report" },
  { value: "customer-sales", label: "Customer Sales Report" },
];

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "This Week", days: 7 },
  { label: "This Month", days: 30 },
  { label: "This Year", days: 365 },
];

export function Reports() {
  const [reportType, setReportType] = useState<ReportKey>("production");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function applyPreset(days: number) {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().slice(0, 10));
    setDateTo(to.toISOString().slice(0, 10));
  }

  async function runReport() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/reports/${reportType}`, { params: { dateFrom, dateTo } });
      setResult(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function exportCsv() {
    const params = new URLSearchParams({ format: "csv", ...(dateFrom ? { dateFrom } : {}), ...(dateTo ? { dateTo } : {}) });
    const token = localStorage.getItem("tuba_token");
    const url = `${import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"}/reports/${reportType}?${params.toString()}`;
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${reportType}-report.csv`;
        link.click();
      });
  }

  const rows = (result as { rows?: unknown[] })?.rows;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <SelectInput
          label="Report Type"
          options={REPORT_OPTIONS}
          value={reportType}
          onChange={(e) => setReportType(e.target.value as ReportKey)}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">From</span>
          <input type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-gray-700">To</span>
          <input type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.days)}
              className="rounded-md border border-gray-300 px-3 py-2 text-xs hover:bg-gray-50"
            >
              {p.label}
            </button>
          ))}
        </div>
        <button onClick={runReport} className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800">
          Generate
        </button>
        {rows && (
          <button onClick={exportCsv} className="rounded-md border border-farm-700 px-4 py-2 text-sm font-medium text-farm-700 hover:bg-farm-50">
            Export CSV
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}
      {loading && <LoadingSpinner label="Generating report..." />}

      {result != null && !loading && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          {reportType === "profit-loss" ? (
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase text-gray-500">Revenue</p>
                <p className="text-xl font-semibold text-emerald-700">
                  {formatCurrency((result as { revenue: number }).revenue)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Expenses</p>
                <p className="text-xl font-semibold text-red-700">
                  {formatCurrency((result as { totalExpenses: number }).totalExpenses)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Profit</p>
                <p className="text-xl font-semibold text-farm-700">
                  {formatCurrency((result as { profit: number }).profit)}
                </p>
              </div>
            </div>
          ) : Array.isArray(rows) && rows.length > 0 && typeof rows[0] === "object" ? (
            <div className="max-h-[500px] overflow-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-farm-50">
                  <tr>
                    {Object.keys(rows[0] as object).map((key) => (
                      <th key={key} className="px-3 py-2 text-left font-semibold text-farm-800">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row, idx) => (
                    <tr key={idx}>
                      {Object.values(row as Record<string, unknown>).map((value, colIdx) => (
                        <td key={colIdx} className="px-3 py-2 text-gray-700">
                          {typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No data found for the selected range.</p>
          )}
        </div>
      )}
    </div>
  );
}
