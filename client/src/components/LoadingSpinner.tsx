export function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-farm-700">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-farm-200 border-t-farm-600" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
