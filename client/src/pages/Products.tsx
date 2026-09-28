import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { productService } from "../services/entities";
import { Product } from "../types";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/format";

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Product Name", type: "text", required: true },
  { name: "category", label: "Category", type: "text", required: true },
  { name: "unit", label: "Unit (e.g. liter, bottle, pack)", type: "text", required: true },
  { name: "sellingPrice", label: "Selling Price", type: "number", step: "0.01", required: true },
  { name: "description", label: "Description", type: "textarea" },
];

const CREATE_ONLY_FIELDS: FieldConfig[] = [
  { name: "initialQuantity", label: "Initial Stock Quantity", type: "number", step: "0.1" },
  { name: "reorderLevel", label: "Reorder Level", type: "number", step: "0.1" },
];

export function Products() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<Product>(productService.list);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [discontinueTarget, setDiscontinueTarget] = useState<Product | null>(null);

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await productService.update(editing.id, values);
    } else {
      await productService.create(values);
    }
    reload();
  }

  async function handleDiscontinue() {
    if (!discontinueTarget) return;
    await productService.remove(discontinueTarget.id);
    setDiscontinueTarget(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage the product catalog sold from farm output.</p>
        {canManage && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
          >
            + Add Product
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(p) => p.id}
        emptyTitle="No products yet"
        columns={[
          { header: "Name", render: (p) => p.name },
          { header: "Category", render: (p) => p.category },
          { header: "Unit", render: (p) => p.unit },
          { header: "Price", render: (p) => formatCurrency(p.sellingPrice) },
          {
            header: "Status",
            render: (p) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  p.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {p.status}
              </span>
            ),
          },
          ...(canManage
            ? [
                {
                  header: "Actions",
                  render: (p: Product) => (
                    <div className="flex gap-3">
                      <button
                        className="text-sm text-farm-700 hover:underline"
                        onClick={() => {
                          setEditing(p);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:underline" onClick={() => setDiscontinueTarget(p)}>
                        Discontinue
                      </button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <CrudFormModal
        open={modalOpen}
        title={editing ? "Edit Product" : "Add Product"}
        fields={editing ? FIELDS : [...FIELDS, ...CREATE_ONLY_FIELDS]}
        initialValues={editing ?? {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!discontinueTarget}
        title="Discontinue Product"
        message={`Discontinue "${discontinueTarget?.name}"? It will no longer be available for new sales.`}
        confirmLabel="Discontinue"
        onConfirm={handleDiscontinue}
        onCancel={() => setDiscontinueTarget(null)}
      />
    </div>
  );
}
