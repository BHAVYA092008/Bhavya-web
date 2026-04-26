import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, Youtube, Twitter } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

export default function Footer() {
  const s = useSettings();
  const socials = [
    { url: s.instagram, Icon: Instagram, label: "Instagram" },
    { url: s.facebook, Icon: Facebook, label: "Facebook" },
    { url: s.youtube, Icon: Youtube, label: "YouTube" },
    { url: s.twitter, Icon: Twitter, label: "Twitter" },
  ].filter((x) => x.url);

  return (
    <footer className="bg-[#0F0F0F] text-[#FFFDF0] mt-20" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="font-display text-2xl font-black mb-3">{s.site_name?.toUpperCase()}</div>
          <p className="text-sm text-[#D1D1D1]">{s.tagline}</p>
        </div>
        <div>
          <div className="font-bold uppercase tracking-widest text-xs mb-3 text-[#FF9E79]">Shop</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/products?cat=photo-mugs" className="hover:text-[#FF9E79]">Photo Mugs</Link></li>
            <li><Link to="/products?cat=t-shirts" className="hover:text-[#FF9E79]">T-Shirts</Link></li>
            <li><Link to="/products?cat=cushions" className="hover:text-[#FF9E79]">Cushions</Link></li>
            <li><Link to="/products?cat=photo-frames" className="hover:text-[#FF9E79]">Photo Frames</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-bold uppercase tracking-widest text-xs mb-3 text-[#FF9E79]">Help</div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/orders" className="hover:text-[#FF9E79]">Track Order</Link></li>
            <li><a href="/#how-it-works" className="hover:text-[#FF9E79]">How It Works</a></li>
            <li><a href="#contact" className="hover:text-[#FF9E79]">Contact Us</a></li>
            <li><Link to="/admin/login" className="hover:text-[#FF9E79]">Admin</Link></li>
          </ul>
        </div>
        <div id="contact">
          <div className="font-bold uppercase tracking-widest text-xs mb-3 text-[#FF9E79]">Get In Touch</div>
          <ul className="space-y-2 text-sm">
            {s.phone && <li className="flex items-center gap-2"><Phone size={14}/> <a href={`tel:${s.phone.replace(/\s/g,'')}`} className="hover:text-[#FF9E79]" data-testid="footer-phone">{s.phone}</a></li>}
            {s.email && <li className="flex items-center gap-2"><Mail size={14}/> <a href={`mailto:${s.email}`} className="hover:text-[#FF9E79]" data-testid="footer-email">{s.email}</a></li>}
            {s.address && <li className="flex items-center gap-2"><MapPin size={14}/> {s.address}</li>}
          </ul>
          {socials.length > 0 && (
            <div className="flex gap-3 mt-4">
              {socials.map(({ url, Icon, label }) => (
                <a key={label} href={url} target="_blank" rel="noopener noreferrer" data-testid={`social-${label.toLowerCase()}`} aria-label={label} className="w-9 h-9 bg-[#FF9E79] text-black flex items-center justify-center hover:bg-[#FF7A4B]">
                  <Icon size={18}/>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-[#333] py-4 text-center text-xs text-[#888]">© 2026 {s.site_name}. Crafted with care.</div>
    </footer>
  );
}
