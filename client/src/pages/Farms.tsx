import { useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { farmService } from "../services/entities";
import { Farm } from "../types";
import { useAuth } from "../hooks/useAuth";

const FIELDS: FieldConfig[] = [
  { name: "name", label: "Farm Name", type: "text", required: true },
  { name: "location", label: "Location", type: "text", required: true },
  { name: "areaSize", label: "Area Size (hectares)", type: "number", step: "0.1" },
  { name: "description", label: "Description", type: "textarea" },
];

export function Farms() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<Farm>(farmService.list);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Farm | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Farm | null>(null);

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await farmService.update(editing.id, values);
    } else {
      await farmService.create(values);
    }
    reload();
  }

  async function handleArchive() {
    if (!archiveTarget) return;
    await farmService.remove(archiveTarget.id);
    setArchiveTarget(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage your farm locations and view their production summaries.</p>
        {canManage && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
          >
            + Add Farm
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(f) => f.id}
        emptyTitle="No farms yet"
        emptyDescription="Add your first farm to get started."
        columns={[
          {
            header: "Name",
            render: (f) => (
              <Link to={`/farms/${f.id}`} className="font-medium text-farm-700 hover:underline">
                {f.name}
              </Link>
            ),
          },
          { header: "Location", render: (f) => f.location },
          { header: "Trees", render: (f) => f._count?.trees ?? "-" },
          { header: "Area Size", render: (f) => (f.areaSize ? `${f.areaSize} ha` : "-") },
          ...(canManage
            ? [
                {
                  header: "Actions",
                  render: (f: Farm) => (
                    <div className="flex gap-3">
                      <button
                        className="text-sm text-farm-700 hover:underline"
                        onClick={() => {
                          setEditing(f);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:underline" onClick={() => setArchiveTarget(f)}>
                        Archive
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
        title={editing ? "Edit Farm" : "Add Farm"}
        fields={FIELDS}
        initialValues={editing ?? {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive Farm"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? Historical records will be preserved.`}
        confirmLabel="Archive"
        onConfirm={handleArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
}
