import { useEffect, useState, useCallback } from 'react';
import { useSiteConfig } from './useSiteConfig';

/**
 * Charge dynamiquement le script Google reCAPTCHA v3 (une seule fois)
 * et expose une fonction getToken(action) pour l'utiliser avant
 * la soumission d'un formulaire sensible (contact, eVisa, pré-réservation Omra).
 *
 * Usage :
 *   const { getToken, ready } = useRecaptcha();
 *   const token = await getToken('contact');
 */
export function useRecaptcha() {
  const { recaptcha_site_key } = useSiteConfig();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!recaptcha_site_key) return;

    if (window.grecaptcha) {
      setReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${recaptcha_site_key}`;
    script.async = true;
    script.onload = () => {
      window.grecaptcha?.ready(() => setReady(true));
    };
    document.head.appendChild(script);
  }, [recaptcha_site_key]);

  const getToken = useCallback(async (action) => {
    if (!recaptcha_site_key || !window.grecaptcha) {
      // reCAPTCHA non configuré : on laisse passer (le backend gère aussi ce cas en fallback).
      return null;
    }
    try {
      return await window.grecaptcha.execute(recaptcha_site_key, { action });
    } catch (e) {
      console.warn('reCAPTCHA execute a échoué :', e);
      return null;
    }
  }, [recaptcha_site_key]);

  return { getToken, ready: ready || !recaptcha_site_key };
}
