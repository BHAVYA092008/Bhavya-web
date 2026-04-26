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
        <ShoppingBag size={48} className="mx-auto mb-4"/>
        <h2 className="font-display text-3xl font-black uppercase">Your cart is empty</h2>
        <p className="text-[#4A4A4A] mt-2">Browse our amazing personalized gifts.</p>
        <Link to="/products" className="brut-btn mt-6 inline-flex" data-testid="cart-empty-shop-btn">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10" data-testid="cart-page">
      <h1 className="font-display text-4xl md:text-5xl font-black uppercase mb-8">Your Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.lineId} data-testid={`cart-item-${item.lineId}`} className="brut-card p-4 flex gap-4">
              <div className="w-24 h-24 bg-[#FFE5D9] border-2 border-black overflow-hidden flex-shrink-0">
                {item.product_image && <img src={fileUrl(item.product_image)} className="w-full h-full object-cover" alt=""/>}
              </div>
              <div className="flex-1">
                <div className="font-display font-black text-lg">{item.product_name}</div>
                <div className="text-xs text-[#666] mt-1">
                  {item.color && <span>Color: {item.color} · </span>}
                  {item.size && <span>Size: {item.size}</span>}
                </div>
                {item.custom_text && <div className="text-xs italic text-[#666]">"{item.custom_text}"</div>}
                {item.custom_image && <div className="text-xs text-[#FF7A4B]">✓ Custom photo uploaded</div>}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center border-2 border-black">
                    <button onClick={() => updateQty(item.lineId, item.quantity - 1)} data-testid={`qty-minus-${item.lineId}`} className="px-2 py-1 hover:bg-[#FFE5D9]"><Minus size={14}/></button>
                    <span className="px-3 font-bold" data-testid={`qty-value-${item.lineId}`}>{item.quantity}</span>
                    <button onClick={() => updateQty(item.lineId, item.quantity + 1)} data-testid={`qty-plus-${item.lineId}`} className="px-2 py-1 hover:bg-[#FFE5D9]"><Plus size={14}/></button>
                  </div>
                  <div className="font-display text-xl font-black">₹{item.unit_price * item.quantity}</div>
                </div>
              </div>
              <button onClick={() => removeItem(item.lineId)} data-testid={`remove-${item.lineId}`} className="text-[#FF7A4B] hover:text-red-600 self-start"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>

        <div className="brut-card p-6 h-fit lg:sticky lg:top-24" data-testid="cart-summary">
          <div className="font-display text-2xl font-black uppercase mb-4">Summary</div>
          <div className="flex justify-between mb-2"><span>Subtotal</span><span className="font-bold" data-testid="subtotal">₹{subtotal}</span></div>
          <div className="flex justify-between mb-2 text-sm text-[#666]"><span>Shipping</span><span>{subtotal >= 499 ? "FREE" : "₹49"}</span></div>
          <div className="border-t-2 border-black my-3"/>
          <div className="flex justify-between font-display text-2xl font-black"><span>Total</span><span data-testid="cart-total">₹{subtotal + (subtotal >= 499 ? 0 : 49)}</span></div>
          <Link to="/checkout" className="brut-btn w-full justify-center mt-4" data-testid="checkout-btn">Proceed to Checkout</Link>
          <Link to="/products" className="block text-center mt-3 text-sm font-bold underline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
