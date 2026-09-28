import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { saleService } from "../services/entities";
import { Sale } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { getErrorMessage } from "../services/api";

export function SaleDetails() {
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    saleService
      .details(id)
      .then((res) => setSale(res as Sale))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!sale) return null;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/sales" className="text-sm text-farm-700 hover:underline">
          &larr; Back to Sales
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-gray-900">Sale #{sale.id.slice(0, 8)}</h2>
        <p className="text-sm text-gray-500">
          {sale.customer?.name} &middot; {formatDate(sale.saleDate)} &middot; {sale.paymentMethod} ({sale.paymentStatus})
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-farm-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-farm-800">Product</th>
              <th className="px-4 py-3 text-left font-semibold text-farm-800">Quantity</th>
              <th className="px-4 py-3 text-left font-semibold text-farm-800">Unit Price</th>
              <th className="px-4 py-3 text-left font-semibold text-farm-800">Line Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sale.saleItems.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">{item.product?.name}</td>
                <td className="px-4 py-3">
                  {item.quantity} {item.product?.unit}
                </td>
                <td className="px-4 py-3">{formatCurrency(item.unitPrice)}</td>
                <td className="px-4 py-3 font-medium">{formatCurrency(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto max-w-xs space-y-1 rounded-lg bg-farm-50 p-4 text-sm">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(sale.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Discount</span>
          <span>-{formatCurrency(sale.discount)}</span>
        </div>
        <div className="flex justify-between text-base font-semibold text-farm-800">
          <span>Total</span>
          <span>{formatCurrency(sale.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}
