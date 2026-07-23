import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const SiteConfigContext = createContext(null);

const DEFAULT_CONFIG = {
  recaptcha_site_key: null,
  site_name: 'Aelia Travel',
  logos: { color: null, white: null, bw: null },
};

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    axios.get('/api/config')
      .then(({ data }) => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => {}) // si l'API échoue, on garde le fallback (texte stylisé pour le logo)
      .finally(() => setLoaded(true));
  }, []);

  return (
    <SiteConfigContext.Provider value={{ ...config, loaded }}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    return { ...DEFAULT_CONFIG, loaded: false };
  }
  return ctx;
}
