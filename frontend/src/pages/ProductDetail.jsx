import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, fileUrl } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Upload, ShoppingCart, Check } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [customText, setCustomText] = useState("");
  const [customImage, setCustomImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [added, setAdded] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setColor(r.data.colors?.[0] || "");
      setSize(r.data.sizes?.[0] || "");
    });
  }, [id]);

  const handleCustomFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "custom");
      const { data } = await api.post("/upload", fd);
      setCustomImage(data.path);
    } catch (e) {
      alert("Upload failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = () => {
    if (!product) return;
    addItem({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0],
      unit_price: product.price,
      quantity: 1,
      color, size, custom_text: customText, custom_image: customImage,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleBuyNow = () => {
    handleAdd();
    setTimeout(() => navigate("/cart"), 200);
  };

  if (!product) return <div className="max-w-7xl mx-auto px-6 py-20 text-center">Loading...</div>;

  const mainImg = product.images?.[activeImage] || product.images?.[0];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10" data-testid="product-detail-page">
      <div className="grid lg:grid-cols-2 gap-10">
        {/* Left: Sticky preview */}
        <div className="lg:sticky lg:top-24 self-start space-y-4">
          <div className="brut-card aspect-square bg-[#FFE5D9] overflow-hidden relative">
            {mainImg && <img src={fileUrl(mainImg)} alt={product.name} className="w-full h-full object-cover"/>}
            {previewUrl && (
              <div className="absolute bottom-4 right-4 w-24 h-24 border-2 border-black brut-shadow-sm bg-white overflow-hidden">
                <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover"/>
              </div>
            )}
            {customText && (
              <div className="absolute top-4 left-4 right-4 text-center font-display text-2xl font-black bg-white/80 border-2 border-black px-3 py-2">
                {customText}
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} data-testid={`thumb-${i}`} className={`flex-shrink-0 w-20 h-20 border-2 ${activeImage === i ? "border-[#FF7A4B] brut-shadow-sm" : "border-black"} bg-white overflow-hidden`}>
                  <img src={fileUrl(img)} alt={`${i}`} className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          )}
          {product.video && (
            <div className="brut-card overflow-hidden">
              {product.video.includes("youtube") || product.video.includes("youtu.be") ? (
                <iframe className="w-full aspect-video" src={product.video.replace("watch?v=", "embed/")} title="Product video" allowFullScreen/>
              ) : (
                <video controls className="w-full" src={fileUrl(product.video)}/>
              )}
            </div>
          )}
        </div>

        {/* Right: Customizer */}
        <div className="space-y-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#FF7A4B]">{product.category?.replace("-", " ")}</div>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase mt-1">{product.name}</h1>
            <div className="font-display text-3xl font-black mt-3">₹{product.price}</div>
            <p className="mt-4 text-[#4A4A4A]">{product.description}</p>
          </div>

          {product.colors?.length > 0 && (
            <div>
              <div className="font-bold uppercase tracking-widest text-xs mb-2">Color</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} data-testid={`color-${c}`} onClick={() => setColor(c)} className={`px-4 py-2 border-2 border-black font-bold text-sm ${color === c ? "bg-[#FF9E79] brut-shadow-sm" : "bg-white hover:bg-[#FFE5D9]"}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div>
              <div className="font-bold uppercase tracking-widest text-xs mb-2">Size</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} data-testid={`size-${s}`} onClick={() => setSize(s)} className={`px-4 py-2 border-2 border-black font-bold text-sm ${size === s ? "bg-[#FF9E79] brut-shadow-sm" : "bg-white hover:bg-[#FFE5D9]"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="font-bold uppercase tracking-widest text-xs mb-2">Your Photo</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCustomFile} data-testid="custom-photo-input"/>
            <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-black bg-white p-6 text-center hover:bg-[#FFE5D9]" data-testid="custom-photo-upload-btn">
              <Upload className="mx-auto mb-2"/>
              <div className="font-bold text-sm uppercase">{uploading ? "Uploading..." : (customImage ? "Photo uploaded ✓ Click to change" : "Upload your photo")}</div>
            </button>
          </div>

          <div>
            <div className="font-bold uppercase tracking-widest text-xs mb-2">Custom Text (Optional)</div>
            <input
              data-testid="custom-text-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Add a name, message or quote..."
              maxLength={50}
              className="brut-input w-full"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={handleAdd} disabled={uploading} data-testid="add-to-cart-btn" className="brut-btn brut-btn-secondary flex-1 justify-center">
              {added ? <><Check size={18}/> Added!</> : <><ShoppingCart size={18}/> Add to Cart</>}
            </button>
            <button onClick={handleBuyNow} disabled={uploading} data-testid="buy-now-btn" className="brut-btn flex-1 justify-center">Buy Now</button>
          </div>

          <div className="text-xs text-[#666] pt-2">✓ Free shipping above ₹499 · ✓ COD available · ✓ Easy returns</div>
        </div>
      </div>
    </div>
  );
}
