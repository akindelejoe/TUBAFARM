import "./chartSetup";
import { Bar } from "react-chartjs-2";
import { CATEGORICAL, INK } from "./chartColors";

export function CategoryBarChart({
  title,
  labels,
  values,
}: {
  title: string;
  labels: string[];
  values: number[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-gray-700">{title}</p>
      <Bar
        data={{
          labels,
          datasets: [
            {
              label: title,
              data: values,
              backgroundColor: labels.map((_, i) => CATEGORICAL[i % CATEGORICAL.length]),
              borderRadius: 4,
            },
          ],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: INK.muted } },
            y: { grid: { color: INK.gridline }, ticks: { color: INK.muted } },
          },
        }}
      />
    </div>
  );
}
