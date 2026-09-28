import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function Navbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600" aria-label="Notifications">
          🔔
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-gray-100"
          >
            <span className="font-medium text-gray-800">
              {user?.firstName} {user?.lastName}
            </span>
            <span className="rounded-full bg-farm-100 px-2 py-0.5 text-xs font-semibold text-farm-700">
              {user?.role}
            </span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
