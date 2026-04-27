import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate("/");
    } catch (e) {
      setErr(e.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16" data-testid="signup-page">
      <h1 className="font-display text-4xl font-semibold text-[#2A1F26]">Create Account</h1>
      <p className="text-[#5A4A52] mt-2">Save addresses & track orders easily.</p>
      <form onSubmit={onSubmit} className="brut-card p-6 mt-6 space-y-4">
        <input data-testid="signup-name" required placeholder="Full Name" className="brut-input w-full" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}/>
        <input data-testid="signup-email" type="email" required placeholder="Email" className="brut-input w-full" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}/>
        <input data-testid="signup-password" type="password" required minLength={6} placeholder="Password (min 6 chars)" className="brut-input w-full" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}/>
        {err && <div className="text-red-600 text-sm" data-testid="signup-error">{err}</div>}
        <button type="submit" disabled={loading} className="brut-btn w-full justify-center" data-testid="signup-submit">{loading ? "..." : "Create Account"}</button>
        <div className="text-sm text-center text-[#5A4A52]">Have an account? <Link to="/login" className="font-medium text-[#C68F8F] underline">Login</Link></div>
      </form>
    </div>
  );
}
