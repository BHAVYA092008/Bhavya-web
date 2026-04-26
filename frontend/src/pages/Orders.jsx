import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const STATUS_COLOR = {
  pending: "#FFF1B6",
  processing: "#C8E0FF",
  shipped: "#FFD6E7",
  delivered: "#C9F0DD",
  cancelled: "#ff8888",
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
        <h2 className="font-display text-3xl font-black uppercase">Login Required</h2>
        <p className="mt-2 text-[#666]">Please login to view your orders.</p>
        <Link to="/login" className="brut-btn mt-4 inline-flex">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10" data-testid="my-orders-page">
      <h1 className="font-display text-4xl md:text-5xl font-black uppercase mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#666]">No orders yet.</p>
          <Link to="/products" className="brut-btn mt-4 inline-flex">Start Shopping</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link to={`/order/${o.id}`} key={o.id} data-testid={`order-row-${o.id}`} className="brut-card p-5 flex items-center gap-4">
              <div className="w-16 h-16 bg-[#FFE5D9] border-2 border-black overflow-hidden flex-shrink-0">
                {o.items?.[0]?.product_image && <img src={fileUrl(o.items[0].product_image)} className="w-full h-full object-cover" alt=""/>}
              </div>
              <div className="flex-1">
                <div className="font-bold">Order #{o.id.slice(0, 8).toUpperCase()}</div>
                <div className="text-xs text-[#666]">{new Date(o.created_at).toLocaleDateString()} · {o.items?.length} items</div>
              </div>
              <div className="text-right">
                <div className="font-display text-xl font-black">₹{o.total}</div>
                <span className="text-xs font-bold uppercase px-2 py-1 border-2 border-black inline-block mt-1" style={{background: STATUS_COLOR[o.status] || "#fff"}}>{o.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
