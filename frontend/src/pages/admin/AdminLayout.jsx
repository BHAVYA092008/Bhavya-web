import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, LogOut } from "lucide-react";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("gs_admin_token");
    navigate("/admin/login");
  };

  const linkCls = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-3 border-2 border-black font-bold uppercase text-sm ${isActive ? "bg-[#FF9E79] brut-shadow-sm" : "bg-white hover:bg-[#FFE5D9]"}`;

  return (
    <div className="min-h-screen bg-[#FFFDF0]" data-testid="admin-layout">
      <div className="border-b-2 border-black bg-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <Link to="/admin/dashboard" className="font-display text-xl font-black uppercase">GS Admin</Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs font-bold uppercase hover:underline">View Site</Link>
            <button onClick={logout} className="brut-btn brut-btn-secondary !py-1 !px-3 text-xs" data-testid="admin-logout-btn"><LogOut size={14}/> Logout</button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        <nav className="space-y-2 md:sticky md:top-20 self-start">
          <NavLink to="/admin/dashboard" className={linkCls} data-testid="admin-nav-dashboard"><LayoutDashboard size={16}/> Dashboard</NavLink>
          <NavLink to="/admin/orders" className={linkCls} data-testid="admin-nav-orders"><ShoppingBag size={16}/> Orders</NavLink>
          <NavLink to="/admin/products" className={linkCls} data-testid="admin-nav-products"><Package size={16}/> Products</NavLink>
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
}
