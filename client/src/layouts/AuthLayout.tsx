import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-farm-950 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-farm-800">TUBA Farm</h1>
          <p className="text-sm text-gray-500">Farm Management System</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
