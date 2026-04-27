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

  if (!product) return <div className="max-w-7xl mx-auto px-6 py-20 text-center text-[#8B7B81]">Loading...</div>;

  const mainImg = product.images?.[activeImage] || product.images?.[0];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 py-10" data-testid="product-detail-page">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14">
        <div className="lg:sticky lg:top-28 self-start space-y-4">
          <div className="rounded-2xl aspect-square bg-[#FDF6F4] overflow-hidden relative border border-[#EFE3E0]">
            {mainImg && <img src={fileUrl(mainImg)} alt={product.name} className="w-full h-full object-cover"/>}
            {previewUrl && (
              <div className="absolute bottom-4 right-4 w-24 h-24 rounded-xl bg-white overflow-hidden shadow-lg border border-[#EFE3E0]">
                <img src={previewUrl} alt="Your photo" className="w-full h-full object-cover"/>
              </div>
            )}
            {customText && (
              <div className="absolute top-4 left-4 right-4 text-center font-script italic text-2xl text-[#2A1F26] bg-white/80 backdrop-blur rounded-lg px-3 py-2">
                {customText}
              </div>
            )}
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} data-testid={`thumb-${i}`} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden ${activeImage === i ? "ring-2 ring-[#D4A5A5]" : "border border-[#EFE3E0]"}`}>
                  <img src={fileUrl(img)} alt={`${i}`} className="w-full h-full object-cover"/>
                </button>
              ))}
            </div>
          )}
          {product.video && (
            <div className="rounded-xl overflow-hidden border border-[#EFE3E0]">
              {product.video.includes("youtube") || product.video.includes("youtu.be") ? (
                <iframe className="w-full aspect-video" src={product.video.replace("watch?v=", "embed/")} title="Product video" allowFullScreen/>
              ) : (
                <video controls className="w-full" src={fileUrl(product.video)}/>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="tag-pill mb-3">{product.category?.replace("-", " ")}</div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#2A1F26] leading-tight">{product.name}</h1>
            <div className="font-display text-3xl font-semibold mt-3 text-[#2A1F26]">₹{product.price}</div>
            <p className="mt-4 text-[#5A4A52] leading-relaxed">{product.description}</p>
          </div>

          {product.colors?.length > 0 && (
            <div>
              <div className="font-medium uppercase tracking-[0.18em] text-xs mb-2 text-[#8B7B81]">Color</div>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button key={c} data-testid={`color-${c}`} onClick={() => setColor(c)} className={`px-4 py-2 rounded-full text-sm transition-all ${color === c ? "bg-[#2A1F26] text-white" : "bg-white border border-[#E2D0CD] text-[#5A4A52] hover:border-[#D4A5A5]"}`}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {product.sizes?.length > 0 && (
            <div>
              <div className="font-medium uppercase tracking-[0.18em] text-xs mb-2 text-[#8B7B81]">Size</div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((sz) => (
                  <button key={sz} data-testid={`size-${sz}`} onClick={() => setSize(sz)} className={`px-4 py-2 rounded-full text-sm transition-all ${size === sz ? "bg-[#2A1F26] text-white" : "bg-white border border-[#E2D0CD] text-[#5A4A52] hover:border-[#D4A5A5]"}`}>{sz}</button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="font-medium uppercase tracking-[0.18em] text-xs mb-2 text-[#8B7B81]">Your Photo</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCustomFile} data-testid="custom-photo-input"/>
            <button onClick={() => fileRef.current?.click()} className="w-full border border-dashed border-[#D4A5A5] bg-[#FDF6F4] rounded-xl p-6 text-center hover:bg-[#FBE9EC] transition-colors" data-testid="custom-photo-upload-btn">
              <Upload className="mx-auto mb-2 text-[#C68F8F]" size={22}/>
              <div className="text-sm text-[#5A4A52]">{uploading ? "Uploading..." : (customImage ? "Photo uploaded ✓ Click to change" : "Upload your photo")}</div>
            </button>
          </div>

          <div>
            <div className="font-medium uppercase tracking-[0.18em] text-xs mb-2 text-[#8B7B81]">Custom Text (Optional)</div>
            <input
              data-testid="custom-text-input"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Add a name, message or quote..."
              maxLength={50}
              className="brut-input w-full"
            />
          </div>

          <div className="flex gap-3 pt-3">
            <button onClick={handleAdd} disabled={uploading} data-testid="add-to-cart-btn" className="brut-btn brut-btn-secondary flex-1 justify-center">
              {added ? <><Check size={16}/> Added!</> : <><ShoppingCart size={16}/> Add to Cart</>}
            </button>
            <button onClick={handleBuyNow} disabled={uploading} data-testid="buy-now-btn" className="brut-btn flex-1 justify-center btn-accent">Buy Now</button>
          </div>

          <div className="text-xs text-[#8B7B81] pt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>✓ Free shipping above ₹499</span><span>✓ COD available</span><span>✓ Easy returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
