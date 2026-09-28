import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { farmService } from "../services/entities";
import { formatDate, formatNumber } from "../utils/format";
import { getErrorMessage } from "../services/api";

interface FarmDetailsData {
  farm: { id: string; name: string; location: string; areaSize?: number | null; description?: string | null };
  treeCount: number;
  activeTreeCount: number;
  totalProductionLiters: number;
  recentTappingRecords: {
    id: string;
    tapDate: string;
    quantityLiters: number;
    quality: string;
    tree?: { treeCode: string };
  }[];
}

export function FarmDetails() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<FarmDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    farmService
      .details(id)
      .then((res) => setData(res as FarmDetailsData))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/farms" className="text-sm text-farm-700 hover:underline">
          &larr; Back to Farms
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">{data.farm.name}</h2>
        <p className="text-sm text-gray-500">{data.farm.location}</p>
        {data.farm.description && <p className="mt-1 text-sm text-gray-600">{data.farm.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Total Trees</p>
          <p className="mt-1 text-2xl font-semibold text-farm-700">{data.treeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Active Trees</p>
          <p className="mt-1 text-2xl font-semibold text-farm-700">{data.activeTreeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Total Production</p>
          <p className="mt-1 text-2xl font-semibold text-farm-700">
            {formatNumber(data.totalProductionLiters, "L")}
          </p>
        </div>
      </div>

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
    </div>
  );
}
