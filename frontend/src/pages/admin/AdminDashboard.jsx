import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { api } from "../../lib/api";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) return <AdminLayout><div className="p-8">Loading...</div></AdminLayout>;

  const cards = [
    { label: "Total Orders", value: stats.total_orders, color: "#FFD6E7" },
    { label: "Earnings", value: `₹${stats.earnings}`, color: "#C9F0DD" },
    { label: "Pending", value: stats.pending, color: "#FFF1B6" },
    { label: "Delivered", value: stats.delivered, color: "#C8E0FF" },
  ];

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl font-black uppercase mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="brut-card p-5" style={{background: c.color}} data-testid={`stat-${c.label.toLowerCase().replace(/ /g,'-')}`}>
            <div className="text-xs font-bold uppercase tracking-widest">{c.label}</div>
            <div className="font-display text-3xl font-black mt-2">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="brut-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-display text-xl font-black uppercase">Recent Orders</div>
          <Link to="/admin/orders" className="text-sm font-bold underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#0F0F0F] text-[#FFFDF0]">
              <tr>
                <th className="text-left px-3 py-2">Order</th>
                <th className="text-left px-3 py-2">Customer</th>
                <th className="text-left px-3 py-2">Total</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent.map((o) => (
                <tr key={o.id} className="border-t border-[#ddd]">
                  <td className="px-3 py-2 font-mono">#{o.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-3 py-2">{o.customer_name}</td>
                  <td className="px-3 py-2 font-bold">₹{o.total}</td>
                  <td className="px-3 py-2 uppercase text-xs font-bold">{o.status}</td>
                </tr>
              ))}
              {stats.recent.length === 0 && <tr><td colSpan="4" className="text-center py-6 text-[#666]">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
