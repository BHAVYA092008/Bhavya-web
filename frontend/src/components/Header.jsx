import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Search, User, Menu, X, LogOut } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";
import { fileUrl } from "../lib/api";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const { count } = useCart();
  const { user, logout } = useAuth();
  const s = useSettings();
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/products?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-[#EFE3E0]" data-testid="site-header">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3" data-testid="header-logo">
          {s.logo ? (
            <img src={fileUrl(s.logo)} alt="logo" className="h-12 w-12 rounded-full object-cover bg-[#FDF6F4]"/>
          ) : (
            <div className="w-10 h-10 bg-[#D4A5A5] text-white rounded-full flex items-center justify-center font-display text-lg font-semibold">G</div>
          )}
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-lg font-semibold text-[#2A1F26]">{s.site_name}</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8B7B81]">Custom Gifts</span>
          </div>
        </Link>

        <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
          <div className="flex w-full bg-[#FDF6F4] border border-[#EFE3E0] rounded-full overflow-hidden focus-within:border-[#D4A5A5]">
            <input
              data-testid="header-search-input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search photo mugs, t-shirts..."
              className="flex-1 px-4 py-2 outline-none bg-transparent text-sm"
            />
            <button type="submit" data-testid="header-search-btn" className="px-4 text-[#5A4A52] hover:text-[#2A1F26]">
              <Search size={18} />
            </button>
          </div>
        </form>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/products" className="px-3 py-2 text-sm font-medium text-[#5A4A52] hover:text-[#2A1F26]" data-testid="nav-shop">Shop</Link>
          {user ? (
            <>
              <Link to="/orders" className="px-3 py-2 text-sm font-medium text-[#5A4A52] hover:text-[#2A1F26]" data-testid="nav-my-orders">My Orders</Link>
              <button onClick={logout} className="px-3 py-2 text-sm font-medium text-[#5A4A52] hover:text-[#2A1F26] flex items-center gap-1" data-testid="nav-logout">
                <LogOut size={14}/> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-2 text-sm font-medium text-[#5A4A52] hover:text-[#2A1F26] flex items-center gap-1" data-testid="nav-login">
              <User size={14}/> Login
            </Link>
          )}
          <Link to="/cart" className="relative ml-2 w-10 h-10 rounded-full bg-[#FDF6F4] hover:bg-[#FBE9EC] flex items-center justify-center text-[#2A1F26] transition-colors" data-testid="nav-cart">
            <ShoppingCart size={18}/>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4A5A5] text-white w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-semibold" data-testid="cart-count-badge">{count}</span>
            )}
          </Link>
        </nav>

        <button className="md:hidden text-[#2A1F26]" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle">
          {open ? <X/> : <Menu/>}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#EFE3E0] bg-white px-4 py-4 space-y-3">
          <form onSubmit={onSearch} className="flex bg-[#FDF6F4] border border-[#EFE3E0] rounded-full overflow-hidden">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="flex-1 px-4 py-2 outline-none bg-transparent" data-testid="mobile-search-input"/>
            <button className="px-4 text-[#5A4A52]"><Search size={18}/></button>
          </form>
          <Link to="/products" className="block py-2 text-[#2A1F26]" onClick={()=>setOpen(false)}>Shop</Link>
          <Link to="/cart" className="block py-2 text-[#2A1F26]" onClick={()=>setOpen(false)}>Cart ({count})</Link>
          {user ? (
            <>
              <Link to="/orders" className="block py-2 text-[#2A1F26]" onClick={()=>setOpen(false)}>My Orders</Link>
              <button onClick={()=>{logout(); setOpen(false);}} className="block py-2 text-[#2A1F26]">Logout</button>
            </>
          ) : (
            <Link to="/login" className="block py-2 text-[#2A1F26]" onClick={()=>setOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </header>
  );
}
