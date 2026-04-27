import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { fileUrl } from "../lib/api";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

export default function Cart() {
  const { items, removeItem, updateQty, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center" data-testid="empty-cart">
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FDF6F4] flex items-center justify-center mb-4">
          <ShoppingBag size={28} className="text-[#C68F8F]"/>
        </div>
        <h2 className="font-display text-3xl font-semibold text-[#2A1F26]">Your cart is empty</h2>
        <p className="text-[#5A4A52] mt-2">Browse our beautifully personalized gifts.</p>
        <Link to="/products" className="brut-btn mt-6 inline-flex" data-testid="cart-empty-shop-btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10" data-testid="cart-page">
      <h1 className="font-display text-4xl md:text-5xl font-semibold text-[#2A1F26] mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.lineId} data-testid={`cart-item-${item.lineId}`} className="brut-card p-4 flex gap-4">
              <div className="w-24 h-24 bg-[#FDF6F4] rounded-lg overflow-hidden flex-shrink-0">
                {item.product_image && <img src={fileUrl(item.product_image)} className="w-full h-full object-cover" alt=""/>}
              </div>
              <div className="flex-1">
                <div className="font-display font-semibold text-base md:text-lg text-[#2A1F26]">{item.product_name}</div>
                <div className="text-xs text-[#8B7B81] mt-1">
                  {item.color && <span>Color: {item.color} · </span>}
                  {item.size && <span>Size: {item.size}</span>}
                </div>
                {item.custom_text && <div className="text-xs italic text-[#8B7B81] font-script">"{item.custom_text}"</div>}
                {item.custom_image && <div className="text-xs text-[#C68F8F]">✓ Custom photo uploaded</div>}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-[#E2D0CD] rounded-full">
                    <button onClick={() => updateQty(item.lineId, item.quantity - 1)} data-testid={`qty-minus-${item.lineId}`} className="px-3 py-1.5 text-[#5A4A52] hover:text-[#2A1F26]"><Minus size={12}/></button>
                    <span className="px-3 text-sm font-medium" data-testid={`qty-value-${item.lineId}`}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.lineId, item.quantity + 1)} data-testid={`qty-plus-${item.lineId}`} className="px-3 py-1.5 text-[#5A4A52] hover:text-[#2A1F26]"><Plus size={12}/></button>
                  </div>
                  <div className="font-display text-lg font-semibold text-[#2A1F26]">₹{item.unit_price * item.quantity}</div>
                </div>
              </div>
              <button onClick={() => removeItem(item.lineId)} data-testid={`remove-${item.lineId}`} className="text-[#8B7B81] hover:text-red-500 self-start"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>

        <div className="brut-card p-6 h-fit lg:sticky lg:top-28" data-testid="cart-summary">
          <div className="font-display text-xl font-semibold text-[#2A1F26] mb-4">Summary</div>
          <div className="flex justify-between mb-2 text-sm"><span className="text-[#5A4A52]">Subtotal</span><span className="font-medium" data-testid="subtotal">₹{subtotal}</span></div>
          <div className="flex justify-between mb-2 text-sm text-[#8B7B81]"><span>Shipping</span><span>{subtotal >= 499 ? "FREE" : "₹49"}</span></div>
          <div className="border-t border-[#EFE3E0] my-3"/>
          <div className="flex justify-between font-display text-xl font-semibold text-[#2A1F26]"><span>Total</span><span data-testid="cart-total">₹{subtotal + (subtotal >= 499 ? 0 : 49)}</span></div>
          <Link to="/checkout" className="brut-btn w-full justify-center mt-5" data-testid="checkout-btn">Proceed to Checkout</Link>
          <Link to="/products" className="block text-center mt-3 text-sm text-[#5A4A52] hover:text-[#C68F8F] underline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
