import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const SettingsContext = createContext(null);

const DEFAULTS = {
  site_name: "GS Customize Hub",
  tagline: "Personalized gifts that tell your story",
  phone: "+91 99999 99999",
  email: "hello@gscustomizehub.com",
  address: "India",
  whatsapp: "919999999999",
  facebook: "",
  instagram: "",
  youtube: "",
  twitter: "",
  logo: "",
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(DEFAULTS);
  useEffect(() => {
    api.get("/settings").then((r) => setSettings({ ...DEFAULTS, ...r.data })).catch(() => {});
  }, []);
  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext) || DEFAULTS;
