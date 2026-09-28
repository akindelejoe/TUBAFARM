import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-gray-50 text-center">
      <h1 className="text-4xl font-bold text-farm-700">404</h1>
      <p className="text-gray-500">Page not found</p>
      <Link to="/dashboard" className="mt-4 text-sm text-farm-700 hover:underline">
        Back to Dashboard
      </Link>
    </div>
  );
}
