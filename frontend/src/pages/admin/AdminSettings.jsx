import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import { api, fileUrl } from "../../lib/api";
import FileUploader from "../../components/FileUploader";
import { Save, Check, X } from "lucide-react";

const FIELDS = [
  { key: "site_name", label: "Site Name", placeholder: "GS Customize Hub" },
  { key: "tagline", label: "Tagline", placeholder: "Personalized gifts that tell your story" },
  { key: "phone", label: "Contact Phone", placeholder: "+91 99999 99999" },
  { key: "email", label: "Contact Email", placeholder: "hello@yourbrand.com", type: "email" },
  { key: "address", label: "Address", placeholder: "Your business address" },
  { key: "whatsapp", label: "WhatsApp Number (with country code, no +)", placeholder: "919999999999", help: "Format: 919876543210 (no +, no spaces)" },
  { key: "facebook", label: "Facebook URL", placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram URL", placeholder: "https://instagram.com/yourhandle" },
  { key: "youtube", label: "YouTube URL", placeholder: "https://youtube.com/@yourchannel" },
  { key: "twitter", label: "Twitter / X URL", placeholder: "https://x.com/yourhandle" },
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/settings").then((r) => setSettings(r.data));
  }, []);

  const update = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/admin/settings", settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert(e.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl font-black uppercase mb-2">Site Settings</h1>
      <p className="text-[#666] mb-6">Yahan se contact info, social media links aur logo update karo. Changes turant website par show honge.</p>

      <form onSubmit={save} className="space-y-6 max-w-3xl">
        <div className="brut-card p-6">
          <div className="font-display text-lg font-black uppercase mb-4">Brand Logo</div>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 border-2 border-black bg-[#FFE5D9] flex items-center justify-center overflow-hidden">
              {settings.logo ? (
                <img src={fileUrl(settings.logo)} alt="logo" className="w-full h-full object-contain"/>
              ) : (
                <span className="font-display text-3xl font-black">G</span>
              )}
            </div>
            <div className="flex-1">
              <FileUploader
                accept="image/*"
                folder="branding"
                onUploaded={(path) => update("logo", path)}
                testid="logo-uploader"
              />
              {settings.logo && (
                <button type="button" onClick={() => update("logo", "")} className="mt-2 text-xs font-bold underline flex items-center gap-1">
                  <X size={12}/> Remove logo
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="brut-card p-6 space-y-4">
          <div className="font-display text-lg font-black uppercase">Contact & Social</div>
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-bold uppercase tracking-widest block mb-1">{f.label}</label>
              <input
                data-testid={`settings-${f.key}`}
                type={f.type || "text"}
                placeholder={f.placeholder}
                value={settings[f.key] || ""}
                onChange={(e) => update(f.key, e.target.value)}
                className="brut-input w-full"
              />
              {f.help && <div className="text-xs text-[#666] mt-1">{f.help}</div>}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="brut-btn" data-testid="save-settings-btn">
            <Save size={16}/> {saving ? "Saving..." : "Save Settings"}
          </button>
          {saved && <span className="text-green-700 font-bold flex items-center gap-1"><Check size={16}/> Saved!</span>}
        </div>
      </form>
    </AdminLayout>
  );
}
