import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { api, fileUrl } from "../../lib/api";
import { Download, X } from "lucide-react";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [active, setActive] = useState(null);

  const load = () => api.get(`/admin/orders${filter ? `?status=${filter}` : ""}`).then((r) => setOrders(r.data));

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (oid, status) => {
    await api.put(`/admin/orders/${oid}/status`, { status });
    load();
    if (active?.id === oid) setActive({ ...active, status });
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl font-black uppercase mb-4">Orders</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => setFilter("")} className={`px-3 py-1.5 border-2 border-black text-xs font-bold uppercase ${!filter ? "bg-[#0F0F0F] text-[#FFFDF0]" : "bg-white"}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} data-testid={`order-filter-${s}`} onClick={() => setFilter(s)} className={`px-3 py-1.5 border-2 border-black text-xs font-bold uppercase ${filter === s ? "bg-[#0F0F0F] text-[#FFFDF0]" : "bg-white"}`}>{s}</button>
        ))}
      </div>

      <div className="brut-card p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#0F0F0F] text-[#FFFDF0]">
            <tr>
              <th className="text-left px-3 py-2">Order</th>
              <th className="text-left px-3 py-2">Customer</th>
              <th className="text-left px-3 py-2">Items</th>
              <th className="text-left px-3 py-2">Total</th>
              <th className="text-left px-3 py-2">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[#ddd]" data-testid={`admin-order-${o.id}`}>
                <td className="px-3 py-2 font-mono">#{o.id.slice(0,8).toUpperCase()}</td>
                <td className="px-3 py-2">{o.customer_name}<br/><span className="text-xs text-[#666]">{o.customer_phone}</span></td>
                <td className="px-3 py-2">{o.items?.length}</td>
                <td className="px-3 py-2 font-bold">₹{o.total}</td>
                <td className="px-3 py-2">
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} data-testid={`status-select-${o.id}`} className="border-2 border-black px-2 py-1 text-xs font-bold uppercase">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2"><button onClick={() => setActive(o)} className="font-bold text-xs underline">View</button></td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="6" className="text-center py-8 text-[#666]">No orders</td></tr>}
          </tbody>
        </table>
      </div>

      {active && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="brut-card max-w-2xl w-full bg-white max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b-2 border-black p-4 sticky top-0 bg-white">
              <div className="font-display text-xl font-black uppercase">Order #{active.id.slice(0,8).toUpperCase()}</div>
              <button onClick={() => setActive(null)}><X/></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest">Customer</div>
                <div>{active.customer_name} · {active.customer_phone}</div>
                <div className="text-xs text-[#666]">{active.customer_email}</div>
                <div className="text-sm">{active.address}, {active.city} - {active.pincode}</div>
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2">Items</div>
                <div className="space-y-3">
                  {active.items?.map((i, idx) => (
                    <div key={idx} className="flex gap-3 border-2 border-black p-2 bg-[#FFFDF0]">
                      <div className="w-16 h-16 bg-[#FFE5D9] border-2 border-black overflow-hidden">
                        {i.product_image && <img src={fileUrl(i.product_image)} className="w-full h-full object-cover" alt=""/>}
                      </div>
                      <div className="flex-1 text-sm">
                        <div className="font-bold">{i.product_name}</div>
                        <div className="text-xs">Qty: {i.quantity} {i.color && `· ${i.color}`} {i.size && `· ${i.size}`}</div>
                        {i.custom_text && <div className="text-xs italic">"{i.custom_text}"</div>}
                        {i.custom_image && (
                          <a href={fileUrl(i.custom_image)} target="_blank" rel="noreferrer" className="text-xs font-bold underline flex items-center gap-1 mt-1" data-testid={`download-custom-${idx}`}>
                            <Download size={12}/> Download Custom Image
                          </a>
                        )}
                      </div>
                      <div className="font-bold">₹{i.line_total}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between font-display text-lg font-black border-t-2 border-black pt-3">
                <span>Total</span><span>₹{active.total}</span>
              </div>
              <div className="text-xs uppercase tracking-widest font-bold">Payment: {active.payment_method} ({active.payment_status})</div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
