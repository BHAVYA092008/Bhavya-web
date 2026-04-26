import React, { useState } from "react";
import { api } from "../lib/api";
import { UploadCloud, X, Loader2 } from "lucide-react";

export default function FileUploader({ accept = "image/*", folder = "products", multiple = false, onUploaded, value = [], testid = "file-uploader" }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploadedPaths = [];
      for (const file of Array.from(fileList)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        const { data } = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
        uploadedPaths.push(data.path);
      }
      onUploaded?.(multiple ? [...value, ...uploadedPaths] : uploadedPaths[0]);
    } catch (e) {
      alert("Upload failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      data-testid={testid}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      className={`border-2 border-dashed border-black p-6 text-center cursor-pointer ${dragOver ? "bg-[#FFE5D9]" : "bg-white"}`}
    >
      <label className="cursor-pointer flex flex-col items-center gap-2">
        {uploading ? <Loader2 className="animate-spin" /> : <UploadCloud size={28} />}
        <span className="text-sm font-bold uppercase">{uploading ? "Uploading..." : "Drop or click to upload"}</span>
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          data-testid={`${testid}-input`}
        />
      </label>
    </div>
  );
}
