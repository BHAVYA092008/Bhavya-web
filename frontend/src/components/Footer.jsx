import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, Youtube, Twitter } from "lucide-react";
import { useSettings } from "../context/SettingsContext";
import { fileUrl } from "../lib/api";

export default function Footer() {
  const s = useSettings();
  const socials = [
    { url: s.instagram, Icon: Instagram, label: "Instagram" },
    { url: s.facebook, Icon: Facebook, label: "Facebook" },
    { url: s.youtube, Icon: Youtube, label: "YouTube" },
    { url: s.twitter, Icon: Twitter, label: "Twitter" },
  ].filter((x) => x.url);

  return (
    <footer className="bg-[#FAF6F2] border-t border-[#EFE3E0] mt-20" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            {s.logo && <img src={fileUrl(s.logo)} alt="" className="h-10 w-10 rounded-full object-cover bg-white"/>}
            <div className="font-display text-xl font-semibold text-[#2A1F26]">{s.site_name}</div>
          </div>
          <p className="text-sm text-[#5A4A52] leading-relaxed">{s.tagline}</p>
        </div>
        <div>
          <div className="font-medium uppercase tracking-[0.18em] text-xs mb-4 text-[#8B7B81]">Shop</div>
          <ul className="space-y-2.5 text-sm text-[#5A4A52]">
            <li><Link to="/products?cat=photo-mugs" className="hover:text-[#C68F8F]">Photo Mugs</Link></li>
            <li><Link to="/products?cat=t-shirts" className="hover:text-[#C68F8F]">T-Shirts</Link></li>
            <li><Link to="/products?cat=cushions" className="hover:text-[#C68F8F]">Cushions</Link></li>
            <li><Link to="/products?cat=photo-frames" className="hover:text-[#C68F8F]">Photo Frames</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-medium uppercase tracking-[0.18em] text-xs mb-4 text-[#8B7B81]">Help</div>
          <ul className="space-y-2.5 text-sm text-[#5A4A52]">
            <li><Link to="/orders" className="hover:text-[#C68F8F]">Track Order</Link></li>
            <li><a href="/#how-it-works" className="hover:text-[#C68F8F]">How It Works</a></li>
            <li><a href="#contact" className="hover:text-[#C68F8F]">Contact Us</a></li>
            <li><Link to="/admin/login" className="hover:text-[#C68F8F]">Admin</Link></li>
          </ul>
        </div>
        <div id="contact">
          <div className="font-medium uppercase tracking-[0.18em] text-xs mb-4 text-[#8B7B81]">Get In Touch</div>
          <ul className="space-y-2.5 text-sm text-[#5A4A52]">
            {s.phone && <li className="flex items-center gap-2"><Phone size={13}/> <a href={`tel:${s.phone.replace(/\s/g,'')}`} className="hover:text-[#C68F8F]" data-testid="footer-phone">{s.phone}</a></li>}
            {s.email && <li className="flex items-center gap-2"><Mail size={13}/> <a href={`mailto:${s.email}`} className="hover:text-[#C68F8F]" data-testid="footer-email">{s.email}</a></li>}
            {s.address && <li className="flex items-center gap-2"><MapPin size={13}/> {s.address}</li>}
          </ul>
          {socials.length > 0 && (
            <div className="flex gap-2 mt-5">
              {socials.map(({ url, Icon, label }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" data-testid={`social-${label.toLowerCase()}`} aria-label={label} className="w-9 h-9 rounded-full bg-white border border-[#EFE3E0] text-[#5A4A52] hover:bg-[#D4A5A5] hover:text-white hover:border-[#D4A5A5] flex items-center justify-center transition-colors">
                  <Icon size={16}/>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-[#EFE3E0] py-5 text-center text-xs text-[#8B7B81]">© 2026 {s.site_name}. Crafted with care.</div>
    </footer>
  );
}
