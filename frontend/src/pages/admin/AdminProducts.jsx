import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { api, fileUrl } from "../../lib/api";
import FileUploader from "../../components/FileUploader";
import { Plus, Edit, Trash2, X } from "lucide-react";

const empty = {
  name: "", description: "", category: "photo-mugs", price: 0, stock: 100,
  colors: [], sizes: [], images: [], video: "", is_featured: false, is_active: true,
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null); // null | empty | product
  const [categories, setCategories] = useState([]);

  const load = () => api.get("/admin/products").then((r) => setProducts(r.data));
  useEffect(() => {
    load();
    api.get("/categories").then((r) => setCategories(r.data));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...editing, price: Number(editing.price), stock: Number(editing.stock) };
    if (payload.id) {
      await api.put(`/admin/products/${payload.id}`, payload);
    } else {
      await api.post("/admin/products", payload);
    }
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="font-display text-3xl font-black uppercase">Products</h1>
        <button onClick={() => setEditing({ ...empty })} className="brut-btn" data-testid="add-product-btn"><Plus size={16}/> Add Product</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="brut-card overflow-hidden" data-testid={`admin-product-${p.id}`}>
            <div className="aspect-video bg-[#FFE5D9] border-b-2 border-black overflow-hidden">
              {p.images?.[0] && <img src={fileUrl(p.images[0])} alt="" className="w-full h-full object-cover"/>}
            </div>
            <div className="p-4">
              <div className="text-xs uppercase font-bold tracking-widest text-[#FF7A4B]">{p.category}</div>
              <div className="font-display text-lg font-black">{p.name}</div>
              <div className="flex items-center justify-between mt-2">
                <div className="font-bold">₹{p.price} · Stock {p.stock}</div>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)} data-testid={`edit-${p.id}`} className="border-2 border-black bg-white p-1 hover:bg-[#FFE5D9]"><Edit size={14}/></button>
                  <button onClick={() => remove(p.id)} data-testid={`delete-${p.id}`} className="border-2 border-black bg-white p-1 hover:bg-red-100"><Trash2 size={14}/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-auto" onClick={() => setEditing(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="brut-card max-w-2xl w-full bg-white max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between border-b-2 border-black p-4 sticky top-0 bg-white">
              <div className="font-display text-xl font-black uppercase">{editing.id ? "Edit" : "Add"} Product</div>
              <button type="button" onClick={() => setEditing(null)}><X/></button>
            </div>
            <div className="p-5 space-y-3">
              <input required placeholder="Name" data-testid="product-name" className="brut-input w-full" value={editing.name} onChange={(e) => setEditing({...editing, name: e.target.value})}/>
              <textarea required placeholder="Description" data-testid="product-desc" rows={3} className="brut-input w-full" value={editing.description} onChange={(e) => setEditing({...editing, description: e.target.value})}/>
              <div className="grid grid-cols-3 gap-3">
                <select className="brut-input" data-testid="product-category" value={editing.category} onChange={(e) => setEditing({...editing, category: e.target.value})}>
                  {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
                <input type="number" required placeholder="Price" data-testid="product-price" className="brut-input" value={editing.price} onChange={(e) => setEditing({...editing, price: e.target.value})}/>
                <input type="number" placeholder="Stock" data-testid="product-stock" className="brut-input" value={editing.stock} onChange={(e) => setEditing({...editing, stock: e.target.value})}/>
              </div>
              <input placeholder="Colors (comma separated)" data-testid="product-colors" className="brut-input w-full" value={editing.colors.join(", ")} onChange={(e) => setEditing({...editing, colors: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}/>
              <input placeholder="Sizes (comma separated)" data-testid="product-sizes" className="brut-input w-full" value={editing.sizes.join(", ")} onChange={(e) => setEditing({...editing, sizes: e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})}/>

              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2">Images</div>
                <FileUploader folder="products" multiple value={editing.images} onUploaded={(paths) => setEditing({...editing, images: paths})} testid="product-image-uploader"/>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {editing.images.map((img, i) => (
                    <div key={i} className="relative w-16 h-16 border-2 border-black">
                      <img src={fileUrl(img)} className="w-full h-full object-cover" alt=""/>
                      <button type="button" onClick={() => setEditing({...editing, images: editing.images.filter((_, k) => k !== i)})} className="absolute -top-2 -right-2 bg-white border-2 border-black w-5 h-5 text-xs">×</button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-2">Video (URL or upload)</div>
                <input placeholder="YouTube URL or leave blank" data-testid="product-video-url" className="brut-input w-full mb-2" value={editing.video || ""} onChange={(e) => setEditing({...editing, video: e.target.value})}/>
                <FileUploader accept="video/mp4" folder="videos" onUploaded={(path) => setEditing({...editing, video: path})} testid="product-video-uploader"/>
              </div>

              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_featured} onChange={(e) => setEditing({...editing, is_featured: e.target.checked})}/> Featured (show on Home)</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({...editing, is_active: e.target.checked})}/> Active</label>
            </div>
            <div className="border-t-2 border-black p-4 flex justify-end gap-2 sticky bottom-0 bg-white">
              <button type="button" onClick={() => setEditing(null)} className="brut-btn brut-btn-secondary">Cancel</button>
              <button type="submit" className="brut-btn" data-testid="save-product-btn">Save</button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}
