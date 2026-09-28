import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { customerService } from "../services/entities";
import { Customer, Sale } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { getErrorMessage } from "../services/api";

interface CustomerDetailsData {
  customer: Customer;
  totalPurchases: string | number;
  orderCount: number;
  recentSales: Sale[];
}

export function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CustomerDetailsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    customerService
      .details(id)
      .then((res) => setData(res as CustomerDetailsData))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/customers" className="text-sm text-farm-700 hover:underline">
          &larr; Back to Customers
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">{data.customer.name}</h2>
        <p className="text-sm text-gray-500">
          {data.customer.customerType} &middot; {data.customer.phone ?? "No phone"} &middot; {data.customer.email ?? "No email"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Total Purchases</p>
          <p className="mt-1 text-2xl font-semibold text-farm-700">{formatCurrency(data.totalPurchases)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Number of Orders</p>
          <p className="mt-1 text-2xl font-semibold text-farm-700">{data.orderCount}</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-semibold text-gray-700">Purchase History</p>
        <ul className="divide-y divide-gray-100 text-sm">
          {data.recentSales.map((s) => (
            <li key={s.id} className="py-2">
              <div className="flex items-center justify-between">
                <span>{formatDate(s.saleDate)}</span>
                <span className="font-medium">{formatCurrency(s.totalAmount)}</span>
              </div>
              <p className="text-xs text-gray-500">
                {s.saleItems.map((item) => `${item.quantity}x ${item.product?.name}`).join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
