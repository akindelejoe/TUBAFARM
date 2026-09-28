interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "default" | "positive" | "negative" | "warning";
}

const accentClasses: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "text-farm-700",
  positive: "text-emerald-600",
  negative: "text-red-600",
  warning: "text-amber-600",
};

export function StatCard({ label, value, hint, accent = "default" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accentClasses[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
