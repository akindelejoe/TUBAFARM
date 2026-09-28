import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { supplierService } from "../services/entities";
import { Expense, Supplier } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { getErrorMessage } from "../services/api";

interface SupplierDetailsData {
  supplier: Supplier;
  expenses: Expense[];
}

export function SupplierDetails() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<SupplierDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supplierService
      .details(id)
      .then((res) => setData(res as SupplierDetailsData))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/suppliers" className="text-sm text-farm-700 hover:underline">
          &larr; Back to Suppliers
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">{data.supplier.name}</h2>
        <p className="text-sm text-gray-500">
          {data.supplier.phone ?? "No phone"} &middot; {data.supplier.email ?? "No email"}
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">Related Expenses</p>
        {data.expenses.length === 0 ? (
          <p className="text-sm text-gray-400">No expenses recorded for this supplier.</p>
        ) : (
          <ul className="divide-y divide-gray-100 text-sm">
            {data.expenses.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2">
                <span>
                  {e.description} &middot; {formatDate(e.expenseDate)}
                </span>
                <span className="font-medium">{formatCurrency(e.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
