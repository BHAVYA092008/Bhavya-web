import React from "react";
import { Link } from "react-router-dom";
import { fileUrl } from "../lib/api";

export default function ProductCard({ product }) {
  const img = product.images?.[0];
  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="brut-card flex flex-col overflow-hidden group"
    >
      <div className="aspect-square bg-[#FFE5D9] overflow-hidden border-b-2 border-black">
        {img && (
          <img
            src={fileUrl(img)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#FF7A4B]">{product.category?.replace("-", " ")}</div>
        <div className="font-display font-black text-lg leading-tight">{product.name}</div>
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="font-display text-xl font-black">₹{product.price}</div>
          <div className="text-xs font-bold uppercase bg-[#0F0F0F] text-white px-2 py-1">Customize →</div>
        </div>
      </div>
    </Link>
  );
}
