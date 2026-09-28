import { useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { customerService } from "../services/entities";
import { Customer, CustomerType } from "../types";

const TYPE_OPTIONS: { value: CustomerType; label: string }[] = [
  { value: "INDIVIDUAL", label: "Individual" },
  { value: "RETAILER", label: "Retailer" },
  { value: "WHOLESALER", label: "Wholesaler" },
  { value: "DISTRIBUTOR", label: "Distributor" },
];

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "customerType", label: "Customer Type", type: "select", options: TYPE_OPTIONS },
];

export function Customers() {
  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<Customer>(customerService.list);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await customerService.update(editing.id, values);
    } else {
      await customerService.create(values);
    }
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage the customers who purchase your products.</p>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
        >
          + Add Customer
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(c) => c.id}
        emptyTitle="No customers yet"
        columns={[
          {
            header: "Name",
            render: (c) => (
              <Link to={`/customers/${c.id}`} className="font-medium text-farm-700 hover:underline">
                {c.name}
              </Link>
            ),
          },
          { header: "Type", render: (c) => c.customerType },
          { header: "Phone", render: (c) => c.phone ?? "-" },
          { header: "Email", render: (c) => c.email ?? "-" },
          {
            header: "Actions",
            render: (c) => (
              <button
                className="text-sm text-farm-700 hover:underline"
                onClick={() => {
                  setEditing(c);
                  setModalOpen(true);
                }}
              >
                Edit
              </button>
            ),
          },
        ]}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <CrudFormModal
        open={modalOpen}
        title={editing ? "Edit Customer" : "Add Customer"}
        fields={FIELDS}
        initialValues={editing ?? {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
