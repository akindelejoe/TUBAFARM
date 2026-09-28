import "./chartSetup";
import { Line } from "react-chartjs-2";
import { INK } from "./chartColors";
import { formatDateShort } from "../../utils/format";

interface Series {
  label: string;
  color: string;
  data: { date: string; total: number }[];
}

export function TrendLineChart({ title, series }: { title: string; series: Series[] }) {
  const labels = series[0]?.data.map((d) => formatDateShort(d.date)) ?? [];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>
      <Line
        data={{
          labels,
          datasets: series.map((s) => ({
            label: s.label,
            data: s.data.map((d) => d.total),
            borderColor: s.color,
            backgroundColor: s.color,
            borderWidth: 2,
            pointRadius: 3,
            tension: 0.3,
          })),
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { display: series.length > 1, labels: { color: INK.secondary } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: INK.muted } },
            y: { grid: { color: INK.gridline }, ticks: { color: INK.muted } },
          },
        }}
      />
    </div>
  );
}
