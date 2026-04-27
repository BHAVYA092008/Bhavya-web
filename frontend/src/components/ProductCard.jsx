import React from "react";
import { Link } from "react-router-dom";
import { fileUrl } from "../lib/api";

export default function ProductCard({ product }) {
  const img = product.images?.[0];
  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="brut-card group block"
    >
      <div className="aspect-square bg-[#FDF6F4] overflow-hidden">
        {img && (
          <img
            src={fileUrl(img)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
      </div>
      <div className="p-4">
        <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#D4A5A5] mb-1.5">{product.category?.replace("-", " ")}</div>
        <div className="font-display font-semibold text-base md:text-lg text-[#2A1F26] line-clamp-1">{product.name}</div>
        <div className="flex items-center justify-between mt-3">
          <div className="font-display text-lg font-semibold text-[#2A1F26]">₹{product.price}</div>
          <div className="text-xs font-medium text-[#C68F8F] group-hover:text-[#2A1F26] transition-colors">Customize →</div>
        </div>
      </div>
    </Link>
  );
}
