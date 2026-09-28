import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Role } from "../types";

interface NavItem {
  to: string;
  label: string;
  roles?: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/farms", label: "Farms" },
  { to: "/trees", label: "Trees" },
  { to: "/tapping-records", label: "Tapping Records" },
  { to: "/products", label: "Products" },
  { to: "/inventory", label: "Inventory" },
  { to: "/sales", label: "Sales" },
  { to: "/customers", label: "Customers" },
  { to: "/expenses", label: "Expenses", roles: ["ADMIN", "MANAGER"] },
  { to: "/suppliers", label: "Suppliers", roles: ["ADMIN", "MANAGER"] },
  { to: "/users", label: "Users", roles: ["ADMIN"] },
  { to: "/reports", label: "Reports", roles: ["ADMIN", "MANAGER"] },
  { to: "/settings", label: "Settings" },
];

export function Sidebar() {
  const { user } = useAuth();

  const items = NAV_ITEMS.filter((item) => !item.roles || (user && item.roles.includes(user.role)));

  return (
    <aside className="flex h-full w-64 flex-col bg-farm-900 text-farm-50">
      <div className="px-6 py-5 text-xl font-bold tracking-tight text-white">TUBA Farm</div>
      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-farm-700 text-white" : "text-farm-100 hover:bg-farm-800"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-farm-800 px-6 py-4 text-xs text-farm-300">TUBA Farm Management System</div>
    </aside>
  );
}
