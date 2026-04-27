import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { api, fileUrl } from "../../lib/api";
import FileUploader from "../../components/FileUploader";
import { Plus, Edit, Trash2, X } from "lucide-react";

const empty = {
  name: "", description: "", category: "photo-mugs", price: "", stock: 100,
  colors: [], sizes: [], images: [], video: "", is_featured: false, is_active: true,
};

const Field = ({ label, hint, children }) => (
  <div>
    <label className="block text-xs font-medium uppercase tracking-[0.18em] text-[#8B7B81] mb-1.5">{label}</label>
    {children}
    {hint && <div className="text-xs text-[#8B7B81] mt-1">{hint}</div>}
  </div>
);

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [categories, setCategories] = useState([]);

  const load = () => api.get("/admin/products").then((r) => setProducts(r.data));
  useEffect(() => {
    load();
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    if (!editing.name?.trim()) return alert("Product name zaroori hai");
    if (!editing.price || Number(editing.price) <= 0) return alert("Valid price daalo");
    if (!editing.images || editing.images.length === 0) return alert("Kam se kam 1 image upload karo");

    const payload = { ...editing, price: Number(editing.price), stock: Number(editing.stock) || 0 };
    try {
      if (payload.id) {
        await api.put(`/admin/products/${payload.id}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      setEditing(null);
      load();
    } catch (e) {
      alert("Save failed: " + (e.response?.data?.detail || e.message));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-[#2A1F26]">Products</h1>
          <p className="text-sm text-[#8B7B81] mt-1">{products.length} products · Click "Add Product" to create new</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="brut-btn btn-accent" data-testid="add-product-btn">
          <Plus size={16}/> Add Product
        </button>
      </div>

      {products.length === 0 && (
        <div className="brut-card p-10 text-center">
          <div className="font-display text-xl font-semibold text-[#2A1F26]">Koi product nahi hai abhi</div>
          <p className="text-sm text-[#5A4A52] mt-2">Apna pehla product add karo upar wale "Add Product" button se.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="brut-card overflow-hidden" data-testid={`admin-product-${p.id}`}>
            <div className="aspect-video bg-[#FDF6F4] overflow-hidden">
              {p.images?.[0] && <img src={fileUrl(p.images[0])} alt="" className="w-full h-full object-cover"/>}
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase font-medium tracking-[0.18em] text-[#D4A5A5]">{p.category}</div>
              <div className="font-display text-base font-semibold text-[#2A1F26]">{p.name}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-[#5A4A52]">₹{p.price} · Stock {p.stock}</div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(p)} data-testid={`edit-${p.id}`} className="w-8 h-8 rounded-full bg-[#FDF6F4] hover:bg-[#FBE9EC] flex items-center justify-center text-[#5A4A52]"><Edit size={14}/></button>
                  <button onClick={() => remove(p.id)} data-testid={`delete-${p.id}`} className="w-8 h-8 rounded-full bg-[#FDF6F4] hover:bg-red-100 flex items-center justify-center text-[#5A4A52]"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-auto" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-auto shadow-2xl border border-[#EFE3E0]">
            <div className="flex items-center justify-between border-b border-[#EFE3E0] px-6 py-4 sticky top-0 bg-white rounded-t-2xl">
              <div className="font-display text-xl font-semibold text-[#2A1F26]">{editing.id ? "Edit" : "Add New"} Product</div>
              <button type="button" onClick={() => setEditing(null)} className="text-[#8B7B81] hover:text-[#2A1F26]"><X size={20}/></button>
            </div>
            <div className="p-6 space-y-5">
              <Field label="Product Name *">
                <input required placeholder="e.g. Custom Photo Mug" data-testid="product-name" className="brut-input w-full" value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})}/>
              </Field>

              <Field label="Description *" hint="Customer ko product ke baare me batao">
                <textarea required placeholder="Premium ceramic mug with HD photo printing..." data-testid="product-desc" rows={3} className="brut-input w-full" value={editing.description} onChange={(e) => setEditing({...editing, description: e.target.value})}/>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Category *">
                  <select className="brut-input w-full" data-testid="product-category" value={editing.category} onChange={(e) => setEditing({...editing, category: e.target.value})}>
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Price (₹) *">
                  <input type="number" min="1" required placeholder="299" data-testid="product-price" className="brut-input w-full" value={editing.price} onChange={(e) => setEditing({...editing, price: e.target.value})}/>
                </Field>
                <Field label="Stock Qty">
                  <input type="number" min="0" placeholder="100" data-testid="product-stock" className="brut-input w-full" value={editing.stock} onChange={(e) => setEditing({...editing, stock: e.target.value})}/>
                </Field>
              </div>

              <Field label="Colors" hint="Comma se alag karo. Example: White, Black, Pink">
                <input placeholder="White, Black, Pink" data-testid="product-colors" className="brut-input w-full" value={editing.colors.join(", ")} onChange={(e) => setEditing({...editing, colors: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}/>
              </Field>

              <Field label="Sizes" hint="Example: S, M, L, XL  ya  11oz, 15oz">
                <input placeholder="S, M, L, XL" data-testid="product-sizes" className="brut-input w-full" value={editing.sizes.join(", ")} onChange={(e) => setEditing({...editing, sizes: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}/>
              </Field>

              <Field label="Product Images *" hint="Pehli image card par dikhegi. Multiple images add kar sakte ho.">
                <FileUploader folder="products" multiple value={editing.images} onUploaded={(paths) => setEditing({...editing, images: paths})} testid="product-image-uploader"/>
                {editing.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {editing.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#EFE3E0] group">
                        <img src={fileUrl(img)} className="w-full h-full object-cover" alt=""/>
                        {i === 0 && <div className="absolute top-0 left-0 bg-[#D4A5A5] text-white text-[9px] uppercase px-1.5 py-0.5">Main</div>}
                        <button type="button" onClick={() => setEditing({...editing, images: editing.images.filter((_, k) => k !== i)})} className="absolute -top-1 -right-1 bg-white border border-[#EFE3E0] rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-100">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </Field>

              <Field label="Product Video (optional)" hint="YouTube link paste karo, ya MP4 upload karo">
                <input placeholder="https://youtube.com/watch?v=..." data-testid="product-video-url" className="brut-input w-full mb-2" value={editing.video || ""} onChange={(e) => setEditing({...editing, video: e.target.value})}/>
                <FileUploader accept="video/mp4" folder="videos" onUploaded={(path) => setEditing({...editing, video: path})} testid="product-video-uploader"/>
              </Field>

              <div className="space-y-2 pt-2 border-t border-[#EFE3E0]">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#2A1F26]">
                  <input type="checkbox" className="w-4 h-4 accent-[#D4A5A5]" checked={editing.is_featured} onChange={(e) => setEditing({...editing, is_featured: e.target.checked})}/>
                  <span><strong>Featured</strong> — Homepage par "Trending Now" me dikhao</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-[#2A1F26]">
                  <input type="checkbox" className="w-4 h-4 accent-[#D4A5A5]" checked={editing.is_active} onChange={(e) => setEditing({...editing, is_active: e.target.checked})}/>
                  <span><strong>Active</strong> — Customers ko visible karo</span>
                </label>
              </div>
            </div>
            <div className="border-t border-[#EFE3E0] px-6 py-4 flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-2xl">
              <button type="button" onClick={() => setEditing(null)} className="brut-btn brut-btn-secondary">Cancel</button>
              <button type="submit" className="brut-btn btn-accent" data-testid="save-product-btn">{editing.id ? "Update Product" : "Save Product"}</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
