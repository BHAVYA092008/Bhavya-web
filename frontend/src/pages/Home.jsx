import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
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
      <section className="relative bg-gradient-to-br from-[#FDF6F4] via-white to-[#FBE9EC] overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="tag-pill mb-5" data-testid="hero-tag">Personalized · Handcrafted with love</div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] text-[#2A1F26]">
              Gifts that tell <span className="font-script italic text-[#C68F8F]">your story</span>
            </h1>
            <p className="mt-6 text-base md:text-lg max-w-lg text-[#5A4A52] leading-relaxed">
              Upload your photo, add a heartfelt message, and we'll craft it into something beautiful — premium mugs, tees, cushions and frames, made just for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="brut-btn" data-testid="hero-shop-btn">
                <ShoppingBag size={16}/> Start Shopping
              </Link>
              <a href="#how-it-works" className="brut-btn brut-btn-secondary" data-testid="hero-how-btn">
                How It Works <ArrowRight size={16}/>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex">{[...Array(5)].map((_,i)=>(<Star key={i} size={16} className="fill-[#D4A5A5] text-[#D4A5A5]"/>))}</div>
              <div className="text-sm text-[#5A4A52]">4.9 / 5 from 2,400+ happy customers</div>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-2xl aspect-square overflow-hidden bg-white shadow-[0_30px_80px_-20px_rgba(212,165,165,0.4)]">
              <img src="https://images.pexels.com/photos/4271686/pexels-photo-4271686.jpeg?auto=compress&cs=tinysrgb&w=900" alt="Custom gifts" className="w-full h-full object-cover"/>
            </div>
            <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-lg px-5 py-3 hidden md:block border border-[#EFE3E0]">
              <div className="text-xs uppercase tracking-widest text-[#8B7B81]">Free Shipping</div>
              <div className="font-display text-xl font-semibold text-[#2A1F26]">Above ₹499</div>
            </div>
            <div className="absolute -top-5 -right-5 bg-[#D4A5A5] text-white rounded-xl shadow-lg px-5 py-3 hidden md:block">
              <div className="text-xs uppercase tracking-widest opacity-80">Use Code</div>
              <div className="font-display text-xl font-semibold">WELCOME10</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="tag-pill mb-3">Curated Collections</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2A1F26]">Shop by Category</h2>
          </div>
          <Link to="/products" className="hidden md:flex items-center gap-1 text-sm text-[#5A4A52] hover:text-[#2A1F26] hover:gap-2 transition-all">View all <ArrowRight size={14}/></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/products?cat=${cat.slug}`} data-testid={`category-${cat.slug}`} className="brut-card group">
              <div className="aspect-square overflow-hidden bg-[#FDF6F4]">
                <img src={CATEGORY_IMAGES[cat.slug] || cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div className="font-display text-base md:text-lg font-semibold text-[#2A1F26]">{cat.name}</div>
                <ArrowRight size={16} className="text-[#8B7B81] group-hover:text-[#D4A5A5] group-hover:translate-x-0.5 transition-all"/>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-[#FDF6F4] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <div className="tag-pill mb-3">Best Sellers</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2A1F26]">Trending Now</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0,8).map((p) => <ProductCard key={p.id} product={p}/>)}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="text-center mb-14">
          <div className="tag-pill mb-3">Simple as 1·2·3</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2A1F26]">How It Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Package, title: "Pick a Product", desc: "Choose from mugs, tees, cushions, frames & more." },
            { icon: Upload, title: "Customize It", desc: "Upload your photo, add text, pick colors & sizes." },
            { icon: ShoppingBag, title: "Place Order", desc: "Pay securely & get it delivered to your doorstep." },
          ].map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={i} className="brut-card p-8 text-center">
                <div className="w-14 h-14 mx-auto bg-[#FBE9EC] text-[#C68F8F] rounded-full flex items-center justify-center mb-4">
                  <Icon size={26}/>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-[#D4A5A5] mb-1">Step {i+1}</div>
                <div className="font-display text-2xl font-semibold mb-2 text-[#2A1F26]">{step.title}</div>
                <p className="text-[#5A4A52]">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#FAF6F2] py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="tag-pill mb-3">Customer Love</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#2A1F26]">What people say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Priya S.", text: "The photo mug came out so beautifully — better than I imagined! My mom cried happy tears.", role: "Bangalore" },
              { name: "Rahul K.", text: "Best anniversary gift ever. The print quality on the t-shirt is top-notch and shipping was super fast.", role: "Delhi" },
              { name: "Anjali M.", text: "Ordered a custom cushion for my best friend's birthday. She absolutely loved it. Will order again!", role: "Mumbai" },
            ].map((t, i) => (
              <div key={i} className="brut-card p-7">
                <div className="flex mb-4">{[...Array(5)].map((_,k)=>(<Star key={k} size={14} className="fill-[#D4A5A5] text-[#D4A5A5]"/>))}</div>
                <p className="text-[#5A4A52] italic leading-relaxed mb-5 font-script text-lg">"{t.text}"</p>
                <div className="font-display font-semibold text-[#2A1F26]">{t.name}</div>
                <div className="text-xs uppercase tracking-widest text-[#8B7B81] mt-1">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
