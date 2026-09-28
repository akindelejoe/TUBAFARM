import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { treeService } from "../services/entities";
import { Tree } from "../types";
import { formatDate, formatNumber } from "../utils/format";
import { getErrorMessage } from "../services/api";

interface TreeDetailsData {
  tree: Tree;
  totalLifetimeProductionLiters: number;
  averageProductionPerTapping: number;
  recentTappingRecords: { id: string; tapDate: string; quantityLiters: number; quality: string }[];
}

export function TreeDetails() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TreeDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    treeService
      .details(id)
      .then((res) => setData(res as TreeDetailsData))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  const { tree } = data;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/trees" className="text-sm text-farm-700 hover:underline">
          &larr; Back to Trees
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">{tree.treeCode}</h2>
        <p className="text-sm text-gray-500">
          {tree.species} {tree.variety ? `(${tree.variety})` : ""} &middot; {tree.farm?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Planting Date</p>
          <p className="mt-1 text-lg font-semibold text-gray-800">{formatDate(tree.plantingDate)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Status</p>
          <p className="mt-1 text-lg font-semibold text-gray-800">{tree.status}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Lifetime Production</p>
          <p className="mt-1 text-lg font-semibold text-farm-700">
            {formatNumber(data.totalLifetimeProductionLiters, "L")}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Avg. per Tapping</p>
          <p className="mt-1 text-lg font-semibold text-farm-700">
            {formatNumber(data.averageProductionPerTapping, "L")}
          </p>
        </div>
      </div>

      {tree.notes && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Notes</p>
          <p className="mt-1 text-sm text-gray-700">{tree.notes}</p>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">Recent Tapping Records</p>
        <ul className="divide-y divide-gray-100 text-sm">
          {data.recentTappingRecords.map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2">
              <span>{formatDate(r.tapDate)}</span>
              <span className="text-gray-500">{r.quality}</span>
              <span className="font-medium">{formatNumber(r.quantityLiters, "L")}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
