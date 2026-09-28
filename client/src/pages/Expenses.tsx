import { useEffect, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { SelectInput } from "../components/SelectInput";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { expenseService, supplierService } from "../services/entities";
import { Expense, ExpenseCategory, Supplier } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import { ApiListResponse } from "../types";
import { api } from "../services/api";

const CATEGORY_OPTIONS: { value: ExpenseCategory; label: string }[] = [
  { value: "LABOR", label: "Labor" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "TRANSPORTATION", label: "Transportation" },
  { value: "FARM_SUPPLIES", label: "Farm Supplies" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "UTILITIES", label: "Utilities" },
  { value: "OTHER", label: "Other" },
];

async function listExpenses(params: Record<string, unknown>) {
  const { data } = await api.get<ApiListResponse<Expense> & { totalAmount: number }>("/expenses", { params });
  return data;
}

export function Expenses() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    supplierService.list({ pageSize: 100 }).then((res) => setSuppliers(res.data));
  }, []);

  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<Expense>(
    async (params) => {
      const res = await listExpenses(params);
      setTotalAmount(res.totalAmount ?? 0);
      return res;
    },
    { category: categoryFilter || undefined, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined }
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Expense | null>(null);

  const fields: FieldConfig[] = [
    { name: "category", label: "Category", type: "select", required: true, options: CATEGORY_OPTIONS },
    { name: "description", label: "Description", type: "text", required: true },
    { name: "amount", label: "Amount", type: "number", step: "0.01", required: true },
    { name: "expenseDate", label: "Expense Date", type: "date", required: true },
    { name: "supplierId", label: "Supplier (optional)", type: "select", options: suppliers.map((s) => ({ value: s.id, label: s.name })) },
  ];

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await expenseService.update(editing.id, values);
    } else {
      await expenseService.create(values);
    }
    reload();
  }

  async function handleRemove() {
    if (!removeTarget) return;
    await expenseService.remove(removeTarget.id);
    setRemoveTarget(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <SelectInput
            label="Category"
            options={CATEGORY_OPTIONS}
            placeholder="All categories"
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">From</span>
            <input type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">To</span>
            <input type="date" className="rounded-md border border-gray-300 px-3 py-2 text-sm" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
          </label>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Total: <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
          </span>
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
          >
            + Add Expense
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(e) => e.id}
        emptyTitle="No expenses recorded"
        columns={[
          { header: "Date", render: (e) => formatDate(e.expenseDate) },
          { header: "Category", render: (e) => e.category },
          { header: "Description", render: (e) => e.description },
          { header: "Supplier", render: (e) => e.supplier?.name ?? "-" },
          { header: "Amount", render: (e) => formatCurrency(e.amount) },
          {
            header: "Actions",
            render: (e) => (
              <div className="flex gap-3">
                <button
                  className="text-sm text-farm-700 hover:underline"
                  onClick={() => {
                    setEditing(e);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button className="text-sm text-red-600 hover:underline" onClick={() => setRemoveTarget(e)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <CrudFormModal
        open={modalOpen}
        title={editing ? "Edit Expense" : "Add Expense"}
        fields={fields}
        initialValues={editing ? { ...editing, expenseDate: editing.expenseDate?.slice(0, 10) } : {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record?"
        confirmLabel="Delete"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
