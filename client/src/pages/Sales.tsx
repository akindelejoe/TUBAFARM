import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { SaleFormModal } from "../components/SaleFormModal";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { customerService, productService, saleService } from "../services/entities";
import { Customer, Product, Sale } from "../types";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency, formatDate } from "../utils/format";

const STATUS_BADGE: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-amber-100 text-amber-700",
  UNPAID: "bg-red-100 text-red-700",
};

export function Sales() {
  const { user } = useAuth();
  const canSell = user?.role === "ADMIN" || user?.role === "MANAGER" || user?.role === "SALES";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    customerService.list({ pageSize: 200 }).then((res) => setCustomers(res.data));
    productService.list({ pageSize: 200 }).then((res) => setProducts(res.data.filter((p) => p.status === "ACTIVE")));
  }, []);

  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<Sale>(saleService.list);

  async function handleCreate(payload: Record<string, unknown>) {
    await saleService.create(payload);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Record and review multi-product sales transactions.</p>
        {canSell && (
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
          >
            + New Sale
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(s) => s.id}
        emptyTitle="No sales recorded yet"
        columns={[
          { header: "Date", render: (s) => formatDate(s.saleDate) },
          {
            header: "Customer",
            render: (s) => (
              <Link to={`/sales/${s.id}`} className="font-medium text-farm-700 hover:underline">
                {s.customer?.name ?? "-"}
              </Link>
            ),
          },
          { header: "Items", render: (s) => s.saleItems.map((i) => `${i.quantity}x ${i.product?.name}`).join(", ") },
          { header: "Total", render: (s) => formatCurrency(s.totalAmount) },
          {
            header: "Payment",
            render: (s) => (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[s.paymentStatus]}`}>
                {s.paymentStatus}
              </span>
            ),
          },
        ]}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <SaleFormModal
        open={modalOpen}
        customers={customers}
        products={products}
        onSubmit={handleCreate}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
