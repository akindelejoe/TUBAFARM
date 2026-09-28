import { useEffect, useState } from "react";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { SelectInput } from "../components/SelectInput";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { tappingRecordService, treeService, farmService } from "../services/entities";
import { Farm, Quality, TappingRecord, Tree } from "../types";
import { useAuth } from "../hooks/useAuth";
import { formatDate, formatNumber } from "../utils/format";

const QUALITY_OPTIONS: { value: Quality; label: string }[] = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "AVERAGE", label: "Average" },
  { value: "POOR", label: "Poor" },
];

export function TappingRecords() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canCreate = canManage || user?.role === "FARM_WORKER";

  const [farms, setFarms] = useState<Farm[]>([]);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [farmFilter, setFarmFilter] = useState("");
  const [treeFilter, setTreeFilter] = useState("");
  const [qualityFilter, setQualityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    farmService.list({ pageSize: 100 }).then((res) => setFarms(res.data));
    treeService.list({ pageSize: 500 }).then((res) => setTrees(res.data));
  }, []);

  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<TappingRecord>(
    tappingRecordService.list,
    {
      farmId: farmFilter || undefined,
      treeId: treeFilter || undefined,
      quality: qualityFilter || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TappingRecord | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TappingRecord | null>(null);

  const fields: FieldConfig[] = [
    { name: "treeId", label: "Tree", type: "select", required: true, options: trees.map((t) => ({ value: t.id, label: `${t.treeCode} (${t.farm?.name ?? ""})` })) },
    { name: "tapDate", label: "Tap Date", type: "date", required: true },
    { name: "quantityLiters", label: "Quantity (Liters)", type: "number", step: "0.1", required: true },
    { name: "quality", label: "Quality", type: "select", required: true, options: QUALITY_OPTIONS },
    { name: "remarks", label: "Remarks", type: "textarea" },
  ];

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await tappingRecordService.update(editing.id, values);
    } else {
      await tappingRecordService.create(values);
    }
    reload();
  }

  async function handleRemove() {
    if (!removeTarget) return;
    await tappingRecordService.remove(removeTarget.id);
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
            label="Tree"
            options={trees.map((t) => ({ value: t.id, label: t.treeCode }))}
            placeholder="All trees"
            value={treeFilter}
            onChange={(e) => {
              setTreeFilter(e.target.value);
              setPage(1);
            }}
          />
          <SelectInput
            label="Quality"
            options={QUALITY_OPTIONS}
            placeholder="All qualities"
            value={qualityFilter}
            onChange={(e) => {
              setQualityFilter(e.target.value);
              setPage(1);
            }}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">From</span>
            <input
              type="date"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">To</span>
            <input
              type="date"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
          >
            + Record Tapping
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(r) => r.id}
        emptyTitle="No tapping records found"
        columns={[
          { header: "Date", render: (r) => formatDate(r.tapDate) },
          { header: "Tree", render: (r) => r.tree?.treeCode ?? "-" },
          { header: "Farm", render: (r) => r.tree?.farm?.name ?? "-" },
          { header: "Quantity", render: (r) => formatNumber(r.quantityLiters, "L") },
          { header: "Quality", render: (r) => r.quality },
          { header: "Recorded By", render: (r) => (r.recordedBy ? `${r.recordedBy.firstName} ${r.recordedBy.lastName}` : "-") },
          ...(canManage
            ? [
                {
                  header: "Actions",
                  render: (r: TappingRecord) => (
                    <div className="flex gap-3">
                      <button
                        className="text-sm text-farm-700 hover:underline"
                        onClick={() => {
                          setEditing(r);
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button className="text-sm text-red-600 hover:underline" onClick={() => setRemoveTarget(r)}>
                        Delete
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
        title={editing ? "Edit Tapping Record" : "Record Tapping"}
        fields={fields}
        initialValues={editing ? { ...editing, tapDate: editing.tapDate?.slice(0, 10) } : {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!removeTarget}
        title="Delete Tapping Record"
        message="Are you sure you want to delete this tapping record? This cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}
