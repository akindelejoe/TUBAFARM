import { useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { supplierService } from "../services/entities";
import { Supplier } from "../types";

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "phone", label: "Phone", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "address", label: "Address", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export function Suppliers() {
  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<Supplier>(supplierService.list);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Supplier | null>(null);

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await supplierService.update(editing.id, values);
    } else {
      await supplierService.create(values);
    }
    reload();
  }

  async function handleArchive() {
    if (!archiveTarget) return;
    await supplierService.remove(archiveTarget.id);
    setArchiveTarget(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage suppliers linked to your farm expenses.</p>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
        >
          + Add Supplier
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(s) => s.id}
        emptyTitle="No suppliers yet"
        columns={[
          {
            header: "Name",
            render: (s) => (
              <Link to={`/suppliers/${s.id}`} className="font-medium text-farm-700 hover:underline">
                {s.name}
              </Link>
            ),
          },
          { header: "Phone", render: (s) => s.phone ?? "-" },
          { header: "Email", render: (s) => s.email ?? "-" },
          {
            header: "Actions",
            render: (s) => (
              <div className="flex gap-3">
                <button
                  className="text-sm text-farm-700 hover:underline"
                  onClick={() => {
                    setEditing(s);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button className="text-sm text-red-600 hover:underline" onClick={() => setArchiveTarget(s)}>
                  Archive
                </button>
              </div>
            ),
          },
        ]}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <CrudFormModal
        open={modalOpen}
        title={editing ? "Edit Supplier" : "Add Supplier"}
        fields={FIELDS}
        initialValues={editing ?? {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive Supplier"
        message={`Archive "${archiveTarget?.name}"? Related expense history will be preserved.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
