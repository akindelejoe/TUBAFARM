import { useEffect, useState } from "react";
import { StatCard } from "../components/StatCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { TrendLineChart } from "../components/charts/TrendLineChart";
import { CategoryBarChart } from "../components/charts/CategoryBarChart";
import { BRAND_LINE, CATEGORICAL } from "../components/charts/chartColors";
import { DashboardData, fetchDashboard } from "../services/dashboard.service";
import { formatCurrency, formatDate, formatNumber } from "../utils/format";
import { getErrorMessage } from "../services/api";

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard()
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner label="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const { kpis, charts } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total Farms" value={kpis.totalFarms} />
        <StatCard label="Total Trees" value={kpis.totalTrees} />
        <StatCard label="Active Trees" value={kpis.activeTrees} />
        <StatCard label="Today's Production" value={formatNumber(kpis.todaysProductionLiters, "L")} />
        <StatCard label="Monthly Production" value={formatNumber(kpis.monthlyProductionLiters, "L")} />
        <StatCard label="Current Inventory" value={formatNumber(kpis.currentInventoryUnits)} />
        <StatCard label="Monthly Sales" value={formatCurrency(kpis.monthlySales)} accent="positive" />
        <StatCard label="Monthly Expenses" value={formatCurrency(kpis.monthlyExpenses)} accent="negative" />
        <StatCard
          label="Estimated Profit"
          value={formatCurrency(kpis.estimatedProfit)}
          accent={kpis.estimatedProfit >= 0 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TrendLineChart
          title="Daily Tuba Collection (7 days)"
          series={[{ label: "Liters", color: BRAND_LINE, data: charts.dailyTuppingCollection }]}
        />
        <TrendLineChart
          title="Weekly Tuba Collection (8 weeks)"
          series={[{ label: "Liters", color: BRAND_LINE, data: charts.weeklyTuppingCollection }]}
        />
        <TrendLineChart
          title="Monthly Production Trend (12 months)"
          series={[{ label: "Liters", color: BRAND_LINE, data: charts.monthlyProductionTrend }]}
        />
        <TrendLineChart
          title="Revenue vs Expenses (12 months)"
          series={[
            { label: "Revenue", color: CATEGORICAL[0], data: charts.salesTrend },
            { label: "Expenses", color: CATEGORICAL[1], data: charts.expensesTrend },
          ]}
        />
        <CategoryBarChart
          title="Product Sales Breakdown"
          labels={charts.productSalesBreakdown.map((p) => p.productName)}
          values={charts.productSalesBreakdown.map((p) => p.totalRevenue)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Recent Tapping Records</p>
          <ul className="divide-y divide-gray-100 text-sm">
            {data.recentTappingRecords.map((r) => (
              <li key={r.id} className="flex items-center justify-between py-2">
                <span>
                  {r.tree?.treeCode} &middot; {formatDate(r.tapDate)}
                </span>
                <span className="font-medium">{formatNumber(r.quantityLiters, "L")}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Recent Sales</p>
          <ul className="divide-y divide-gray-100 text-sm">
            {data.recentSales.map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2">
                <span>
                  {s.customer?.name} &middot; {formatDate(s.saleDate)}
                </span>
                <span className="font-medium">{formatCurrency(s.totalAmount)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Low Inventory Alerts</p>
          {data.lowInventoryAlerts.length === 0 ? (
            <p className="text-sm text-gray-400">All products are sufficiently stocked.</p>
          ) : (
            <ul className="divide-y divide-gray-100 text-sm">
              {data.lowInventoryAlerts.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <span>{a.product?.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      a.status === "OUT_OF_STOCK" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {a.quantityAvailable} {a.product?.unit} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-gray-700">Highest Producing Trees</p>
          <ul className="divide-y divide-gray-100 text-sm">
            {data.highestProducingTrees.map((t, idx) => (
              <li key={t.tree?.id ?? idx} className="flex items-center justify-between py-2">
                <span>
                  {t.tree?.treeCode} &middot; {t.tree?.farm?.name}
                </span>
                <span className="font-medium">{formatNumber(t.totalLiters, "L")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">Farm Performance Summary</p>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.farmPerformance.map((f) => (
            <li key={f.farmId} className="rounded-lg bg-farm-50 px-4 py-3">
              <p className="text-sm font-medium text-farm-800">{f.farmName}</p>
              <p className="text-lg font-semibold text-farm-700">{formatNumber(f.totalProductionLiters, "L")}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
