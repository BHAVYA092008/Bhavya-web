import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { CheckCircle2, Package, Truck, Home } from "lucide-react";

const STEPS = [
  { id: "pending", label: "Order Placed", icon: CheckCircle2 },
  { id: "processing", label: "Processing", icon: Package },
  { id: "shipped", label: "Shipped", icon: Truck },
  { id: "delivered", label: "Delivered", icon: Home },
];

export default function OrderTrack() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then((r) => setOrder(r.data));
  }, [id]);

  if (!order) return <div className="text-center py-20">Loading...</div>;

  const stepIdx = STEPS.findIndex((s) => s.id === order.status);
  const success = params.get("success") === "1";

  return (
    <div className="max-w-4xl mx-auto px-6 py-10" data-testid="order-track-page">
      {success && (
        <div className="brut-card p-6 mb-6 bg-[#C9F0DD] flex items-center gap-3" data-testid="order-success-banner">
          <CheckCircle2 size={32}/>
          <div>
            <div className="font-display text-xl font-black uppercase">Order Confirmed!</div>
            <div className="text-sm">Thank you for shopping with GS Customize Hub. We'll keep you updated.</div>
          </div>
        </div>
      )}

      <div className="brut-card p-6 mb-6">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF7A4B]">Order ID</div>
            <div className="font-display text-2xl font-black">#{order.id.slice(0, 8).toUpperCase()}</div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF7A4B]">Total</div>
            <div className="font-display text-2xl font-black">₹{order.total}</div>
          </div>
        </div>

        {order.status !== "cancelled" && (
          <div className="grid grid-cols-4 gap-2 mt-6">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const active = i <= stepIdx;
              return (
                <div key={s.id} className="text-center">
                  <div className={`w-12 h-12 mx-auto border-2 border-black flex items-center justify-center ${active ? "bg-[#FF9E79]" : "bg-white"}`}>
                    <Icon size={20}/>
                  </div>
                  <div className={`mt-2 text-xs font-bold uppercase ${active ? "" : "text-[#999]"}`}>{s.label}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="brut-card p-6 mb-6">
        <div className="font-display text-xl font-black uppercase mb-4">Items</div>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 items-center" data-testid={`order-item-${i}`}>
              <div className="w-16 h-16 bg-[#FFE5D9] border-2 border-black overflow-hidden flex-shrink-0">
                {item.product_image && <img src={fileUrl(item.product_image)} className="w-full h-full object-cover" alt=""/>}
              </div>
              <div className="flex-1">
                <div className="font-bold">{item.product_name}</div>
                <div className="text-xs text-[#666]">Qty: {item.quantity} {item.color && ` · ${item.color}`} {item.size && ` · ${item.size}`}</div>
                {item.custom_text && <div className="text-xs italic">"{item.custom_text}"</div>}
              </div>
              <div className="font-bold">₹{item.line_total}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="brut-card p-6">
        <div className="font-display text-xl font-black uppercase mb-3">Delivery</div>
        <div className="text-sm">{order.customer_name} · {order.customer_phone}</div>
        <div className="text-sm text-[#666]">{order.address}, {order.city} - {order.pincode}</div>
        <div className="text-xs uppercase font-bold mt-3 tracking-widest">Payment: {order.payment_method} ({order.payment_status})</div>
      </div>

      <div className="text-center mt-8">
        <Link to="/products" className="brut-btn">Continue Shopping</Link>
      </div>
    </div>
  );
}
