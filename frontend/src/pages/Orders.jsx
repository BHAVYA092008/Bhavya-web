import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLOR = {
  pending: { bg: "#FFF4E5", text: "#9A6500" },
  processing: { bg: "#E8F0FF", text: "#1E55B5" },
  shipped: { bg: "#FBE9EC", text: "#C68F8F" },
  delivered: { bg: "#E5F5EA", text: "#2D7D46" },
  cancelled: { bg: "#FBE5E5", text: "#B23A3A" },
};

export default function Orders() {
  const { user, ready } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!ready || !user) return;
    api.get("/orders/me").then((r) => setOrders(r.data));
  }, [ready, user]);

  if (ready && !user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="font-display text-3xl font-semibold text-[#2A1F26]">Login Required</h2>
        <p className="mt-2 text-[#5A4A52]">Please login to view your orders.</p>
        <Link to="/login" className="brut-btn mt-4 inline-flex">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10" data-testid="my-orders-page">
      <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#2A1F26] mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#8B7B81]">No orders yet.</p>
          <Link to="/products" className="brut-btn mt-4 inline-flex">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const c = STATUS_COLOR[o.status] || { bg: "#fff", text: "#000" };
            return (
              <Link to={`/order/${o.id}`} key={o.id} data-testid={`order-row-${o.id}`} className="brut-card p-5 flex items-center gap-4">
                <div className="w-16 h-16 bg-[#FDF6F4] rounded-lg overflow-hidden flex-shrink-0">
                  {o.items?.[0]?.product_image && <img src={fileUrl(o.items[0].product_image)} className="w-full h-full object-cover" alt=""/>}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#2A1F26]">Order #{o.id.slice(0, 8).toUpperCase()}</div>
                  <div className="text-xs text-[#8B7B81]">{new Date(o.created_at).toLocaleDateString()} · {o.items?.length} items</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-lg font-semibold text-[#2A1F26]">₹{o.total}</div>
                  <span className="text-[10px] font-medium uppercase tracking-widest px-2 py-1 rounded-full inline-block mt-1" style={{background: c.bg, color: c.text}}>{o.status}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
