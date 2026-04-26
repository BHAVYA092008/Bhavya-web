import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { api, fileUrl } from "../lib/api";
import ProductCard from "../components/ProductCard";
import { ArrowRight, Star, Upload, Package, ShoppingBag } from "lucide-react";

const CATEGORY_IMAGES = {
  "photo-mugs": "https://images.unsplash.com/photo-1653104838836-3c79156a7d99?w=600",
  "t-shirts": "https://images.unsplash.com/photo-1622445272461-c6580cab8755?w=600",
  "cushions": "https://images.unsplash.com/photo-1630655115300-7f2c2d4364e0?w=600",
  "photo-frames": "https://images.unsplash.com/photo-1550243595-4cb7dd708a89?w=600",
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/products?featured=true").then((r) => setFeatured(r.data));
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-[#FFE5D9] border-b-2 border-black overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <Marquee speed={30}>
            <div className="outline-text text-[14rem] whitespace-nowrap">GIFTS · CUSTOM · MADE WITH LOVE · </div>
          </Marquee>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-block bg-[#0F0F0F] text-[#FFFDF0] px-3 py-1 font-bold uppercase tracking-widest text-xs mb-5" data-testid="hero-tag">100% Personalized</div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95]">
              Gifts that<br/>tell <span className="bg-[#FF9E79] px-3">your story</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl max-w-lg text-[#4A4A4A]">
              Upload your photo, add a message, pick a color — and we'll print it on premium mugs, tees, cushions & frames.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="brut-btn" data-testid="hero-shop-btn">
                <ShoppingBag size={18}/> Start Shopping
              </Link>
              <a href="#how-it-works" className="brut-btn brut-btn-secondary" data-testid="hero-how-btn">
                How It Works <ArrowRight size={18}/>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex">{[...Array(5)].map((_,i)=>(<Star key={i} size={18} className="fill-[#FF9E79] text-[#FF9E79]"/>))}</div>
              <div className="text-sm font-bold">4.9 / 5 from 2,400+ happy customers</div>
            </div>
          </div>
          <div className="relative">
            <div className="brut-card aspect-square overflow-hidden bg-white">
              <img src="https://images.pexels.com/photos/4271686/pexels-photo-4271686.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Custom gifts" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-[#FFFDF0] border-2 border-black brut-shadow-sm px-4 py-3 hidden md:block">
              <div className="text-xs font-bold uppercase">Free Shipping</div>
              <div className="font-display text-xl font-black">Above ₹499</div>
            </div>
            <div className="absolute -top-4 -right-4 bg-[#FF9E79] border-2 border-black brut-shadow-sm px-4 py-3 hidden md:block rotate-3">
              <div className="text-xs font-bold uppercase">Use Code</div>
              <div className="font-display text-xl font-black">WELCOME10</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex items-end justify-between mb-8">
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase">Shop by Category</h2>
          <Link to="/products" className="hidden md:flex items-center gap-1 font-bold uppercase text-sm hover:gap-2 transition-all">View all <ArrowRight size={16}/></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/products?cat=${cat.slug}`} data-testid={`category-${cat.slug}`} className="brut-card overflow-hidden group">
              <div className="aspect-square overflow-hidden border-b-2 border-black bg-[#FFE5D9]">
                <img src={CATEGORY_IMAGES[cat.slug] || cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"/>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="font-display text-lg md:text-xl font-black">{cat.name}</div>
                <ArrowRight size={18}/>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#FFE5D9] border-y-2 border-black py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase mb-8">Trending Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0,8).map((p) => <ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#0F0F0F] text-[#FFFDF0] px-3 py-1 font-bold uppercase tracking-widest text-xs mb-3">Simple as 1-2-3</div>
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Package, title: "1. Pick a Product", desc: "Choose from mugs, tees, cushions, frames & more.", color: "#FFD6E7" },
            { icon: Upload, title: "2. Customize It", desc: "Upload your photo, add text, pick colors & sizes.", color: "#C9F0DD" },
            { icon: ShoppingBag, title: "3. Place Order", desc: "Pay securely & get it delivered to your doorstep.", color: "#FFF1B6" },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="brut-card p-8 text-center" style={{background: step.color}}>
                <div className="w-16 h-16 mx-auto bg-white border-2 border-black flex items-center justify-center mb-4">
                  <Icon size={32}/>
                </div>
                <div className="font-display text-2xl font-black mb-2">{step.title}</div>
                <p className="text-[#4A4A4A]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#0F0F0F] text-[#FFFDF0] py-16 border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="font-display text-4xl md:text-5xl font-black uppercase mb-10">Customer Love</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Priya S.", text: "The photo mug came out so beautifully — better than I imagined! My mom cried happy tears.", role: "Bangalore" },
              { name: "Rahul K.", text: "Best anniversary gift ever. The print quality on the t-shirt is top-notch and shipping was super fast.", role: "Delhi" },
              { name: "Anjali M.", text: "Ordered a custom cushion for my best friend's birthday. She absolutely loved it. Will order again!", role: "Mumbai" },
            ].map((t, i) => (
              <div key={i} className="border-2 border-[#FF9E79] p-6 bg-[#1a1a1a]">
                <div className="flex mb-3">{[...Array(5)].map((_,k)=>(<Star key={k} size={16} className="fill-[#FF9E79] text-[#FF9E79]"/>))}</div>
                <p className="text-[#D1D1D1] mb-4">"{t.text}"</p>
                <div className="font-display font-black">{t.name}</div>
                <div className="text-xs uppercase tracking-widest text-[#FF9E79]">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
