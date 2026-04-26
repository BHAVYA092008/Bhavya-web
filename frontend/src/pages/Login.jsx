import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (e) {
      setErr(e.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16" data-testid="login-page">
      <h1 className="font-display text-4xl font-black uppercase">Welcome Back</h1>
      <p className="text-[#666] mt-2">Login to track your orders.</p>
      <form onSubmit={onSubmit} className="brut-card p-6 mt-6 space-y-4">
        <input data-testid="login-email" type="email" required placeholder="Email" className="brut-input w-full" value={email} onChange={(e) => setEmail(e.target.value)}/>
        <input data-testid="login-password" type="password" required placeholder="Password" className="brut-input w-full" value={password} onChange={(e) => setPassword(e.target.value)}/>
        {err && <div className="text-red-600 text-sm font-bold" data-testid="login-error">{err}</div>}
        <button type="submit" disabled={loading} className="brut-btn w-full justify-center" data-testid="login-submit">{loading ? "..." : "Login"}</button>
        <div className="text-sm text-center">No account? <Link to="/signup" className="font-bold underline">Sign up</Link></div>
      </form>
      <div className="text-center mt-4 text-sm text-[#666]">Or <Link to="/products" className="underline font-bold">continue as guest</Link></div>
    </div>
  );
}
