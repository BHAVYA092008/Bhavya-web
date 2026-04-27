import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("gs_admin_token")) navigate("/admin/dashboard");
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await api.post("/auth/admin-login", { password });
      localStorage.setItem("gs_admin_token", data.token);
      navigate("/admin/dashboard");
    } catch (e) {
      setErr(e.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16" data-testid="admin-login-page">
      <div className="brut-card p-8">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[#D4A5A5]">Admin</div>
        <h1 className="font-display text-3xl font-semibold text-[#2A1F26]">Login</h1>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input data-testid="admin-password" type="password" required placeholder="Admin Password" className="brut-input w-full" value={password} onChange={(e) => setPassword(e.target.value)}/>
          {err && <div className="text-red-600 text-sm font-bold" data-testid="admin-error">{err}</div>}
          <button type="submit" disabled={loading} className="brut-btn w-full justify-center" data-testid="admin-login-submit">{loading ? "..." : "Enter Admin"}</button>
        </form>
      </div>
    </div>
  );
}
