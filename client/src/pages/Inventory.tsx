import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { Modal } from "../components/Modal";
import { FormInput } from "../components/FormInput";
import { usePaginatedList } from "../hooks/usePaginatedList";
import * as inventoryService from "../services/inventory.service";
import { Inventory as InventoryType } from "../types";
import { useAuth } from "../hooks/useAuth";
import { formatNumber } from "../utils/format";
import { getErrorMessage } from "../services/api";

const STATUS_BADGE: Record<string, string> = {
  IN_STOCK: "bg-emerald-100 text-emerald-700",
  LOW_STOCK: "bg-amber-100 text-amber-700",
  OUT_OF_STOCK: "bg-red-100 text-red-700",
};

type MovementType = "STOCK_IN" | "STOCK_OUT" | "ADJUST";

export function Inventory() {
  const { user } = useAuth();
  const canManage = user?.role === "ADMIN" || user?.role === "MANAGER";

  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<InventoryType>(
    inventoryService.listInventory
  );

  const [movement, setMovement] = useState<{ type: MovementType; inventory: InventoryType } | null>(null);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function openMovement(type: MovementType, inventory: InventoryType) {
    setMovement({ type, inventory });
    setAmount("");
    setNotes("");
    setFormError(null);
  }

  async function handleMovementSubmit() {
    if (!movement) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const quantity = Number(amount);
      if (movement.type === "STOCK_IN") {
        await inventoryService.stockIn({ productId: movement.inventory.productId, quantity, notes });
      } else if (movement.type === "STOCK_OUT") {
        await inventoryService.stockOut({ productId: movement.inventory.productId, quantity, notes });
      } else {
        await inventoryService.adjustInventory({ productId: movement.inventory.productId, newQuantity: quantity, notes });
      }
      setMovement(null);
      reload();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const movementTitle =
    movement?.type === "STOCK_IN" ? "Stock In" : movement?.type === "STOCK_OUT" ? "Stock Out" : "Adjust Inventory";

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Track stock levels and record inventory movements.</p>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(i) => i.id}
        emptyTitle="No inventory records"
        columns={[
          { header: "Product", render: (i) => i.product?.name ?? "-" },
          { header: "Quantity", render: (i) => formatNumber(i.quantityAvailable, i.product?.unit) },
          { header: "Reorder Level", render: (i) => formatNumber(i.reorderLevel, i.product?.unit) },
          {
            header: "Status",
            render: (i) => (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_BADGE[i.status ?? "IN_STOCK"]}`}>
                {i.status?.replace("_", " ")}
              </span>
            ),
          },
          ...(canManage
            ? [
                {
                  header: "Actions",
                  render: (i: InventoryType) => (
                    <div className="flex gap-3">
                      <button className="text-sm text-farm-700 hover:underline" onClick={() => openMovement("STOCK_IN", i)}>
                        Stock In
                      </button>
                      <button className="text-sm text-amber-700 hover:underline" onClick={() => openMovement("STOCK_OUT", i)}>
                        Stock Out
                      </button>
                      <button className="text-sm text-gray-600 hover:underline" onClick={() => openMovement("ADJUST", i)}>
                        Adjust
                      </button>
                    </div>
                  ),
                },
              ]
            : []),
        ]}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <Modal open={!!movement} title={`${movementTitle}: ${movement?.inventory.product?.name ?? ""}`} onClose={() => setMovement(null)}>
        <div className="space-y-4">
          {formError && <ErrorMessage message={formError} />}
          <FormInput
            label={movement?.type === "ADJUST" ? "New Quantity" : "Quantity"}
            type="number"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <FormInput label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <div className="flex justify-end gap-3">
            <button onClick={() => setMovement(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              onClick={handleMovementSubmit}
              disabled={submitting || !amount}
              className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
