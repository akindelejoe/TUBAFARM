import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { SelectInput } from "./SelectInput";
import { FormInput } from "./FormInput";
import { ErrorMessage } from "./ErrorMessage";
import { Customer, PaymentMethod, PaymentStatus, Product } from "../types";
import { formatCurrency } from "../utils/format";
import { getErrorMessage } from "../services/api";

interface LineItem {
  productId: string;
  quantity: number;
}

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Cash" },
  { value: "CARD", label: "Card" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_PAYMENT", label: "Mobile Payment" },
  { value: "OTHER", label: "Other" },
];

const PAYMENT_STATUSES: { value: PaymentStatus; label: string }[] = [
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "UNPAID", label: "Unpaid" },
];

export function SaleFormModal({
  open,
  customers,
  products,
  onSubmit,
  onClose,
}: {
  open: boolean;
  customers: Customer[];
  products: Product[];
  onSubmit: (payload: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}) {
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ productId: "", quantity: 1 }]);
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("UNPAID");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCustomerId("");
      setItems([{ productId: "", quantity: 1 }]);
      setDiscount("0");
      setPaymentMethod("CASH");
      setPaymentStatus("UNPAID");
      setError(null);
    }
  }, [open]);

  function updateItem(index: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addItem() {
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const productMap = new Map(products.map((p) => [p.id, p]));
  const lineTotals = items.map((item) => {
    const product = productMap.get(item.productId);
    const unitPrice = product ? Number(product.sellingPrice) : 0;
    return unitPrice * item.quantity;
  });
  const subtotal = lineTotals.reduce((a, b) => a + b, 0);
  const discountValue = Number(discount) || 0;
  const total = Math.max(0, subtotal - discountValue);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        customerId,
        discount: discountValue,
        paymentMethod,
        paymentStatus,
        items: items
          .filter((i) => i.productId && i.quantity > 0)
          .map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="New Sale" onClose={onClose}>
      <div className="space-y-4">
        {error && <ErrorMessage message={error} />}

        <SelectInput
          label="Customer"
          required
          placeholder="Select customer..."
          options={customers.map((c) => ({ value: c.id, label: c.name }))}
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        />

        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Products</p>
          {items.map((item, index) => (
            <div key={index} className="flex items-end gap-2">
              <div className="flex-1">
                <SelectInput
                  label=""
                  placeholder="Select product..."
                  options={products.map((p) => ({ value: p.id, label: `${p.name} (${formatCurrency(p.sellingPrice)})` }))}
                  value={item.productId}
                  onChange={(e) => updateItem(index, { productId: e.target.value })}
                />
              </div>
              <div className="w-24">
                <FormInput
                  label=""
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                />
              </div>
              <div className="w-24 pb-2 text-right text-sm font-medium text-gray-700">
                {formatCurrency(lineTotals[index] ?? 0)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="pb-2 text-sm text-red-600 hover:underline disabled:opacity-30"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addItem} className="text-sm text-farm-700 hover:underline">
            + Add product
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            label="Payment Method"
            options={PAYMENT_METHODS}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          />
          <SelectInput
            label="Payment Status"
            options={PAYMENT_STATUSES}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          />
        </div>

        <FormInput label="Discount" type="number" step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />

        <div className="space-y-1 rounded-lg bg-farm-50 p-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Discount</span>
            <span>-{formatCurrency(discountValue)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-farm-800">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !customerId || items.every((i) => !i.productId)}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Complete Sale"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
