import { useSiteConfig } from '../Hooks/useSiteConfig';

/**
 * Composant Logo intelligent.
 *
 * Props :
 *  - variant : 'auto' | 'color' | 'white' | 'bw'   (défaut: 'auto')
 *      'auto' utilise 'white' si onDark=true, sinon 'color'.
 *  - onDark  : booléen, indique si le logo est affiché sur un fond sombre
 *              (header transparent sur hero, footer navy...). Influence le
 *              choix de variante en mode 'auto' ET le style du fallback texte.
 *  - height  : hauteur CSS du logo (ex: '42px')
 *  - className : classes Tailwind additionnelles
 */
export default function Logo({ variant = 'auto', onDark = false, height = '42px', className = '' }) {
  const { logos, site_name, loaded } = useSiteConfig();

  let effectiveVariant = variant;
  if (variant === 'auto') {
    effectiveVariant = onDark ? 'white' : 'color';
  }

  const url = logos?.[effectiveVariant];

  // Tant que la config n'est pas chargée, ou si aucune image n'existe pour
  // cette variante, on retombe sur le texte stylisé "✈ Aelia Travel".
  if (!loaded || !url) {
    return (
      <span
        className={`font-serif font-bold tracking-wide whitespace-nowrap ${onDark ? 'text-white' : 'text-navy'} ${className}`}
        style={{ fontSize: `calc(${height} * 0.45)` }}
      >
        ✈ {site_name || 'Aelia Travel'}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={site_name || 'Aelia Travel'}
      style={{ height }}
      className={`w-auto object-contain ${className}`}
    />
  );
}
