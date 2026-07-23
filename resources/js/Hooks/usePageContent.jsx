import { useEffect, useState } from 'react';
import axios from 'axios';

/**
 * Charge le contenu éditable (site_content) d'une page donnée.
 * Retourne { content, loading } où content est un objet indexé par section_key.
 * Tant que le contenu n'est pas chargé, les pages doivent afficher un état
 * de chargement léger ou un contenu par défaut pour éviter un flash vide.
 */
export function usePageContent(page) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    axios.get(`/api/content/${page}`)
      .then(({ data }) => { if (active) setContent(data); })
      .catch(() => { if (active) setContent({}); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page]);

  return { content: content || {}, loading };
}
