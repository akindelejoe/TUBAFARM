import { useState } from "react";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { ErrorMessage } from "../components/ErrorMessage";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { CrudFormModal, FieldConfig } from "../components/CrudFormModal";
import { Modal } from "../components/Modal";
import { FormInput } from "../components/FormInput";
import { usePaginatedList } from "../hooks/usePaginatedList";
import { userService } from "../services/entities";
import { api, getErrorMessage } from "../services/api";
import { Role, User } from "../types";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "FARM_WORKER", label: "Farm Worker" },
  { value: "SALES", label: "Sales" },
];

const CREATE_FIELDS: FieldConfig[] = [
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "lastName", label: "Last Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Temporary Password", type: "text", required: true },
  { name: "role", label: "Role", type: "select", required: true, options: ROLE_OPTIONS },
];

const EDIT_FIELDS: FieldConfig[] = [
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "lastName", label: "Last Name", type: "text", required: true },
  { name: "role", label: "Role", type: "select", required: true, options: ROLE_OPTIONS },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "ACTIVE", label: "Active" },
      { value: "INACTIVE", label: "Inactive" },
    ],
  },
];

export function Users() {
  const { items, pagination, setPage, loading, error, reload } = usePaginatedList<User>(userService.list);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);

  async function handleSubmit(values: Record<string, unknown>) {
    if (editing) {
      await userService.update(editing.id, values);
    } else {
      await userService.create(values);
    }
    reload();
  }

  async function handleDeactivate() {
    if (!deactivateTarget) return;
    await userService.remove(deactivateTarget.id);
    setDeactivateTarget(null);
    reload();
  }

  async function handleResetPassword() {
    if (!resetTarget) return;
    setResetError(null);
    try {
      await api.post(`/users/${resetTarget.id}/reset-password`, { newPassword });
      setResetTarget(null);
      setNewPassword("");
    } catch (err) {
      setResetError(getErrorMessage(err));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Manage system users and their roles. Admin only.</p>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800"
        >
          + Add User
        </button>
      </div>

      {error && <ErrorMessage message={error} />}

      <DataTable
        rows={items}
        loading={loading}
        keyField={(u) => u.id}
        emptyTitle="No users yet"
        columns={[
          { header: "Name", render: (u) => `${u.firstName} ${u.lastName}` },
          { header: "Email", render: (u) => u.email },
          { header: "Role", render: (u) => u.role },
          {
            header: "Status",
            render: (u) => (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                }`}
              >
                {u.status}
              </span>
            ),
          },
          {
            header: "Actions",
            render: (u) => (
              <div className="flex gap-3">
                <button
                  className="text-sm text-farm-700 hover:underline"
                  onClick={() => {
                    setEditing(u);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </button>
                <button className="text-sm text-gray-600 hover:underline" onClick={() => setResetTarget(u)}>
                  Reset Password
                </button>
                <button className="text-sm text-red-600 hover:underline" onClick={() => setDeactivateTarget(u)}>
                  Deactivate
                </button>
              </div>
            ),
          },
        ]}
      />
      <Pagination pagination={pagination} onPageChange={setPage} />

      <CrudFormModal
        open={modalOpen}
        title={editing ? "Edit User" : "Add User"}
        fields={editing ? EDIT_FIELDS : CREATE_FIELDS}
        initialValues={editing ?? {}}
        onSubmit={handleSubmit}
        onClose={() => setModalOpen(false)}
      />

      <ConfirmDialog
        open={!!deactivateTarget}
        title="Deactivate User"
        message={`Deactivate ${deactivateTarget?.firstName} ${deactivateTarget?.lastName}? They will no longer be able to log in.`}
        confirmLabel="Deactivate"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      <Modal open={!!resetTarget} title={`Reset Password: ${resetTarget?.firstName}`} onClose={() => setResetTarget(null)}>
        <div className="space-y-4">
          {resetError && <ErrorMessage message={resetError} />}
          <FormInput
            label="New Password"
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3">
            <button onClick={() => setResetTarget(null)} className="rounded-md border border-gray-300 px-4 py-2 text-sm">
              Cancel
            </button>
            <button
              onClick={handleResetPassword}
              disabled={newPassword.length < 8}
              className="rounded-md bg-farm-700 px-4 py-2 text-sm font-medium text-white hover:bg-farm-800 disabled:opacity-50"
            >
              Reset Password
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
