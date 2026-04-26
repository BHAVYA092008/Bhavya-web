import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("gs_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("gs_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item) => {
    setItems((prev) => [...prev, { ...item, lineId: Math.random().toString(36).slice(2) }]);
  };
  const removeItem = (lineId) => setItems((prev) => prev.filter((i) => i.lineId !== lineId));
  const updateQty = (lineId, qty) => setItems((prev) => prev.map((i) => (i.lineId === lineId ? { ...i, quantity: Math.max(1, qty) } : i)));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + (i.quantity || 1), 0);
  const subtotal = items.reduce((s, i) => s + (i.unit_price || 0) * (i.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
