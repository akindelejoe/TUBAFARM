import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Navbar } from "../components/Navbar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/farms": "Farms",
  "/trees": "Trees",
  "/tapping-records": "Tapping Records",
  "/products": "Products",
  "/inventory": "Inventory",
  "/sales": "Sales",
  "/customers": "Customers",
  "/expenses": "Expenses",
  "/suppliers": "Suppliers",
  "/users": "Users",
  "/reports": "Reports",
  "/settings": "Settings",
};

function resolveTitle(pathname: string) {
  const match = Object.keys(TITLES).find((key) => pathname.startsWith(key));
  return match ? TITLES[match] : "TUBA Farm";
}

export function DashboardLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar title={resolveTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
