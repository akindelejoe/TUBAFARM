import { FormEvent, useEffect, useState } from "react";
import { Modal } from "./Modal";
import { FormInput } from "./FormInput";
import { SelectInput } from "./SelectInput";
import { ErrorMessage } from "./ErrorMessage";
import { getErrorMessage } from "../services/api";

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea" | "email";
  options?: { value: string; label: string }[];
  required?: boolean;
  step?: string;
}

interface CrudFormModalProps {
  open: boolean;
  title: string;
  fields: FieldConfig[];
  initialValues: object;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  onClose: () => void;
}

export function CrudFormModal({ open, title, fields, initialValues, onSubmit, onClose }: CrudFormModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues as Record<string, unknown>);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(initialValues as Record<string, unknown>);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, JSON.stringify(initialValues)]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function update(name: string, value: unknown) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorMessage message={error} />}
        {fields.map((field) => {
          const raw = values[field.name];
          const value = raw === undefined || raw === null ? "" : String(raw);

          if (field.type === "select") {
            return (
              <SelectInput
                key={field.name}
                label={field.label}
                required={field.required}
                options={field.options ?? []}
                placeholder="Select..."
                value={value}
                onChange={(e) => update(field.name, e.target.value)}
              />
            );
          }

          if (field.type === "textarea") {
            return (
              <label key={field.name} className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-gray-700">{field.label}</span>
                <textarea
                  className="rounded-md border border-gray-300 px-3 py-2 focus:border-farm-500 focus:outline-none focus:ring-1 focus:ring-farm-500"
                  rows={3}
                  required={field.required}
                  value={value}
                  onChange={(e) => update(field.name, e.target.value)}
                />
              </label>
            );
          }

          return (
            <FormInput
              key={field.name}
              label={field.label}
              type={field.type}
              step={field.step}
              required={field.required}
              value={value}
              onChange={(e) =>
                update(field.name, field.type === "number" ? Number(e.target.value) : e.target.value)
              }
            />
          );
        })}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="rounded-md border border-gray-300 px-4 py-2 text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
