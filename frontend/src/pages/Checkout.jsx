import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { Loader2, Tag, Check } from "lucide-react";

const RAZORPAY_KEY = process.env.REACT_APP_RAZORPAY_KEY_ID;

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", customer_email: "",
    address: "", city: "", pincode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState({ amount: 0, code: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, customer_name: user.name, customer_email: user.email }));
  }, [user]);

  useEffect(() => {
    if (items.length === 0) navigate("/cart");
  }, [items.length, navigate]);

  const shipping = subtotal >= 499 ? 0 : 49;
  const total = Math.max(0, subtotal + shipping - discount.amount);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const { data } = await api.post(`/coupons/validate?code=${encodeURIComponent(coupon)}&total=${subtotal}`);
      setDiscount({ amount: data.discount, code: data.code });
    } catch (e) {
      alert(e.response?.data?.detail || "Invalid coupon");
      setDiscount({ amount: 0, code: "" });
    }
  };

  const placeOrder = async (razorpayPayload = {}) => {
    setSubmitting(true);
    try {
      const payload = {
        items: items.map(({ lineId, product_name, product_image, unit_price, ...rest }) => rest),
        ...form,
        payment_method: paymentMethod,
        coupon_code: discount.code || null,
        ...razorpayPayload,
      };
      const { data } = await api.post("/orders", payload);
      clear();
      navigate(`/order/${data.id}?success=1`);
    } catch (e) {
      alert(e.response?.data?.detail || "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paymentMethod === "cod") return placeOrder();

    // Razorpay flow
    const ok = await loadRazorpay();
    if (!ok) return alert("Razorpay failed to load. Please retry.");
    setSubmitting(true);
    try {
      const { data: order } = await api.post("/payment/create-order", { amount: total });
      const options = {
        key: order.key_id || RAZORPAY_KEY,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "GS Customize Hub",
        description: "Custom Gift Order",
        prefill: {
          name: form.customer_name,
          email: form.customer_email,
          contact: form.customer_phone,
        },
        theme: { color: "#FF9E79" },
        handler: (response) => {
          placeOrder({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        modal: { ondismiss: () => setSubmitting(false) },
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (e) {
      setSubmitting(false);
      alert(e.response?.data?.detail || "Payment init failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10" data-testid="checkout-page">
      <h1 className="font-display text-4xl md:text-5xl font-black uppercase mb-8">Checkout</h1>
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="brut-card p-6">
            <div className="font-display text-xl font-black uppercase mb-4">Delivery Details</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Full Name *" data-testid="checkout-name" className="brut-input" value={form.customer_name} onChange={(e) => setForm({...form, customer_name: e.target.value})}/>
              <input required placeholder="Phone *" data-testid="checkout-phone" className="brut-input" value={form.customer_phone} onChange={(e) => setForm({...form, customer_phone: e.target.value})}/>
              <input type="email" placeholder="Email (optional)" data-testid="checkout-email" className="brut-input sm:col-span-2" value={form.customer_email} onChange={(e) => setForm({...form, customer_email: e.target.value})}/>
              <textarea required placeholder="Address *" data-testid="checkout-address" rows={2} className="brut-input sm:col-span-2" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}/>
              <input required placeholder="City *" data-testid="checkout-city" className="brut-input" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})}/>
              <input required placeholder="Pincode *" data-testid="checkout-pincode" className="brut-input" value={form.pincode} onChange={(e) => setForm({...form, pincode: e.target.value})}/>
            </div>
          </div>

          <div className="brut-card p-6">
            <div className="font-display text-xl font-black uppercase mb-4">Payment Method</div>
            <div className="space-y-3">
              {[
                { id: "razorpay", label: "Pay Online (UPI / Card / NetBanking)", desc: "Powered by Razorpay" },
                { id: "cod", label: "Cash on Delivery", desc: "Pay when you receive your order" },
              ].map((p) => (
                <label key={p.id} data-testid={`payment-${p.id}`} className={`flex items-center gap-3 border-2 border-black p-4 cursor-pointer ${paymentMethod === p.id ? "bg-[#FFE5D9] brut-shadow-sm" : "bg-white"}`}>
                  <input type="radio" checked={paymentMethod === p.id} onChange={() => setPaymentMethod(p.id)} className="w-4 h-4"/>
                  <div className="flex-1">
                    <div className="font-bold">{p.label}</div>
                    <div className="text-xs text-[#666]">{p.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="brut-card p-6 h-fit lg:sticky lg:top-24">
          <div className="font-display text-xl font-black uppercase mb-4">Order Summary</div>
          <div className="space-y-2 max-h-48 overflow-auto">
            {items.map((i) => (
              <div key={i.lineId} className="flex justify-between text-sm">
                <span className="truncate">{i.product_name} × {i.quantity}</span>
                <span className="font-bold">₹{i.unit_price * i.quantity}</span>
              </div>
            ))}
          </div>
          <div className="border-t-2 border-black my-4"/>

          <div className="flex gap-2 mb-3">
            <input data-testid="coupon-input" value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="brut-input flex-1"/>
            <button type="button" onClick={applyCoupon} data-testid="coupon-apply-btn" className="brut-btn brut-btn-secondary"><Tag size={16}/></button>
          </div>
          {discount.amount > 0 && <div className="text-sm text-green-700 font-bold flex items-center gap-1 mb-2"><Check size={14}/> {discount.code} applied</div>}

          <div className="flex justify-between text-sm mb-1"><span>Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between text-sm mb-1"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
          {discount.amount > 0 && <div className="flex justify-between text-sm mb-1 text-green-700"><span>Discount</span><span>-₹{discount.amount}</span></div>}
          <div className="border-t-2 border-black my-3"/>
          <div className="flex justify-between font-display text-2xl font-black"><span>Total</span><span data-testid="checkout-total">₹{total}</span></div>
          <button type="submit" disabled={submitting} className="brut-btn w-full justify-center mt-4" data-testid="place-order-btn">
            {submitting ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : `Place Order · ₹${total}`}
          </button>
        </div>
      </form>
    </div>
  );
}
