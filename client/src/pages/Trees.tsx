import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { SelectInput } from "../components/SelectInput";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { treeService, farmService } from "../services/entities";
import { Farm, Tree, TreeStatus } from "../types";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/format";

const STATUS_OPTIONS: { value: TreeStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "INACTIVE", label: "Inactive" },
  { value: "DISEASED", label: "Diseased" },
  { value: "REMOVED", label: "Removed" },
];

const STATUS_BADGE: Record<TreeStatus, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  DISEASED: "bg-amber-100 text-amber-700",
  REMOVED: "bg-red-100 text-red-700",
};

export function Trees() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmFilter, setFarmFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    farmService.list({ pageSize: 100 }).then((res) => setFarms(res.data));
  }, []);

  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<Tree>(treeService.list, {
    farmId: farmFilter || undefined,
    status: statusFilter || undefined,
    search: search || undefined,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tree | null>(null);
  const [removeTarget, setRemoveTarget] = useState<Tree | null>(null);

  const fields: FieldConfig[] = [
    { name: "farmId", label: "Farm", type: "select", required: true, options: farms.map((f) => ({ value: f.id, label: f.name })) },
    { name: "treeCode", label: "Tree Code", type: "text", required: true },
    { name: "species", label: "Species", type: "text", required: true },
    { name: "variety", label: "Variety", type: "text" },
    { name: "plantingDate", label: "Planting Date", type: "date", required: true },
    { name: "status", label: "Status", type: "select", options: STATUS_OPTIONS },
    { name: "notes", label: "Notes", type: "textarea" },
  ];

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await treeService.update(editing.id, values);
    } else {
      await treeService.create(values);
    }
    reload();
  }

  async function handleRemove() {
    if (!removeTarget) return;
    await treeService.remove(removeTarget.id);
    setRemoveTarget(null);
    reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <SelectInput
            label="Farm"
            options={farms.map((f) => ({ value: f.id, label: f.name }))}
            placeholder="All farms"
            value={farmFilter}
            onChange={(e) => {
              setFarmFilter(e.target.value);
              setPage(1);
            }}
          />
          <SelectInput
            label="Status"
            options={STATUS_OPTIONS}
            placeholder="All statuses"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Search</span>
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-farm-500 focus:outline-none focus:ring-1 focus:ring-farm-500"
              placeholder="Tree code or species"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        {canManage && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
          >
            + Add Tree
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(t) => t.id}
        emptyTitle="No trees found"
        columns={[
          {
            header: "Tree Code",
            render: (t) => (
              <Link to={`/trees/${t.id}`} className="font-medium text-farm-700 hover:underline">
                {t.treeCode}
              </Link>
            ),
          },
          { header: "Farm", render: (t) => t.farm?.name ?? "-" },
          { header: "Species", render: (t) => t.species },
          { header: "Planted", render: (t) => formatDate(t.plantingDate) },
          {
            header: "Status",
            render: (t) => (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[t.status]}`}>
                {t.status}
              </span>
            ),
          },
          ...(canManage
            ? [
                {
                  header: "Actions",
                  render: (t: Tree) => (
                    <div className="flex gap-3">
                      <button
                        className="text-sm text-farm-700 hover:underline"
                        onClick={() => {
                          setEditing(t);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:underline" onClick={() => setRemoveTarget(t)}>
                        Remove
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
        title={editing ? "Edit Tree" : "Add Tree"}
        fields={fields}
        initialValues={editing ? { ...editing, plantingDate: editing.plantingDate?.slice(0, 10) } : {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove Tree"
        message={`Mark "${removeTarget?.treeCode}" as removed? Historical tapping records will be preserved.`}
        confirmLabel="Remove"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
