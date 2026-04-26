import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF0]/90 backdrop-blur-xl border-b-2 border-black" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2" data-testid="header-logo">
          <div className="w-9 h-9 bg-[#FF9E79] border-2 border-black flex items-center justify-center font-display text-xl font-black">G</div>
          <span className="font-display text-xl font-black tracking-tight hidden sm:block">GS CUSTOMIZE HUB</span>
        </Link>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="flex w-full border-2 border-black bg-white">
            <input
              data-testid="header-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search photo mugs, t-shirts..."
              className="flex-1 px-3 py-2 outline-none bg-white text-sm"
            />
            <button type="submit" data-testid="header-search-btn" className="px-3 bg-[#FF9E79] border-l-2 border-black hover:bg-[#FF7A4B]">
              <Search size={18} />
            </button>
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-2">
          <Link to="/products" className="px-3 py-2 font-bold text-sm uppercase hover:bg-[#FFE5D9]" data-testid="nav-shop">Shop</Link>
          {user ? (
            <>
              <Link to="/orders" className="px-3 py-2 font-bold text-sm uppercase hover:bg-[#FFE5D9]" data-testid="nav-my-orders">My Orders</Link>
              <button onClick={logout} className="px-3 py-2 font-bold text-sm uppercase hover:bg-[#FFE5D9] flex items-center gap-1" data-testid="nav-logout">
                <LogOut size={16}/> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-2 font-bold text-sm uppercase hover:bg-[#FFE5D9] flex items-center gap-1" data-testid="nav-login">
              <User size={16}/> Login
            </Link>
          )}
          <Link to="/cart" className="relative px-3 py-2 font-bold text-sm uppercase hover:bg-[#FFE5D9] flex items-center gap-1" data-testid="nav-cart">
            <ShoppingCart size={18}/>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF9E79] border-2 border-black w-5 h-5 text-[10px] flex items-center justify-center font-black" data-testid="cart-count-badge">{count}</span>
            )}
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle">
          {open ? <X/> : <Menu/>}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t-2 border-black bg-[#FFFDF0] px-4 py-4 space-y-3">
          <form onSubmit={onSearch} className="flex border-2 border-black">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="flex-1 px-3 py-2 outline-none" data-testid="mobile-search-input"/>
            <button className="px-3 bg-[#FF9E79] border-l-2 border-black"><Search size={18}/></button>
          </form>
          <Link to="/products" className="block font-bold py-2" onClick={()=>setOpen(false)}>Shop</Link>
          <Link to="/cart" className="block font-bold py-2" onClick={()=>setOpen(false)}>Cart ({count})</Link>
          {user ? (
            <>
              <Link to="/orders" className="block font-bold py-2" onClick={()=>setOpen(false)}>My Orders</Link>
              <button onClick={()=>{logout(); setOpen(false);}} className="block font-bold py-2">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block font-bold py-2" onClick={()=>setOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
