import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const token = localStorage.getItem("gs_admin_token");
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
