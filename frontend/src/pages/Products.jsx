import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function Products() {
  const [params, setParams] = useSearchParams();
  const cat = params.get("cat") || "";
  const q = params.get("q") || "";
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (cat) qs.set("category", cat);
    if (q) qs.set("q", q);
    api.get(`/products?${qs.toString()}`).then((r) => {
      let items = r.data;
      if (sort === "low") items = [...items].sort((a, b) => a.price - b.price);
      if (sort === "high") items = [...items].sort((a, b) => b.price - a.price);
      setProducts(items);
    }).finally(() => setLoading(false));
  }, [cat, q, sort]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10" data-testid="products-page">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#FF7A4B]">{q ? `Search: "${q}"` : (cat || "All Products")}</div>
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase">
            {q ? "Results" : (cat ? cat.replace("-", " ") : "All Products")}
          </h1>
        </div>
        <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} className="brut-input bg-white">
          <option value="newest">Newest</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setParams(q ? { q } : {})} className={`px-4 py-2 border-2 border-black font-bold uppercase text-xs ${!cat ? "bg-[#0F0F0F] text-[#FFFDF0]" : "bg-white"}`} data-testid="filter-all">All</button>
        {categories.map((c) => (
          <button key={c.slug} data-testid={`filter-${c.slug}`} onClick={() => setParams({ cat: c.slug })} className={`px-4 py-2 border-2 border-black font-bold uppercase text-xs ${cat === c.slug ? "bg-[#0F0F0F] text-[#FFFDF0]" : "bg-white hover:bg-[#FFE5D9]"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold">Loading...</div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center font-bold" data-testid="no-products">No products found.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p}/>)}
        </div>
      )}
    </div>
  );
}
