import { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import Logo from '../Components/Logo';

// Hook qui charge le contenu d'une "page" depuis site_content
function useSiteSection(page, sectionKey) {
  const [data, setData] = useState({});
  useEffect(() => {
    axios.get(`/api/content/${page}`)
      .then(({ data: sections }) => {
        const section = sections.find((s) => s.section_key === sectionKey);
        if (section?.content) setData(section.content);
      })
      .catch(() => {});
  }, [page, sectionKey]);
  return data;
}

export default function MainLayout({ children, alwaysSolid = false, rtl = false }) {
  const [scrolled, setScrolled] = useState(alwaysSolid);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('');

  const navData = useSiteSection('header', 'nav');
  const footerData = useSiteSection('footer', 'info');

  // Valeurs par défaut si pas encore chargées depuis la DB
  const phone    = navData.phone    || '+213 XX XX XX XX';
  const ctaLabel = navData.cta_label || 'Demander un eVisa';
  const ctaUrl   = navData.cta_url   || '/evisa';
  const navLinks = navData.nav_links || [
    { label: 'Accueil',        url: '/' },
    { label: 'eVisa en ligne', url: '/evisa' },
    { label: 'عمرة Omra',     url: '/omra' },
  ];

  useEffect(() => {
    if (alwaysSolid) { setScrolled(true); return; }
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [alwaysSolid]);

  useEffect(() => {
    setActiveLink(window.location.pathname);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.15 }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [children]);

  return (
    <div
      className={rtl ? 'font-arabic' : ''}
      dir={rtl ? 'rtl' : 'ltr'}
      style={rtl ? { fontFamily: "'Tajawal', 'Noto Naskh Arabic', sans-serif" } : {}}
    >
      {/* ── Navigation ── */}
      <header
        className={`fixed top-0 inset-x-0 z-[1000] transition-all duration-500 ${
          scrolled
            ? 'bg-[#00143C]/95 backdrop-blur-xl shadow-[0_4px_40px_rgba(0,20,60,0.3)]'
            : 'bg-transparent'
        }`}
        style={{ height: scrolled ? '68px' : '84px' }}
      >
        <nav className="h-full max-w-[1280px] mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <Logo onDark height={scrolled ? '36px' : '44px'} className="transition-all duration-300" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-full ${
                  activeLink === link.url
                    ? 'text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/8'
                }`}
              >
                {link.label}
                {activeLink === link.url && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C9A84C]" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-white/60 text-sm hover:text-white/90 transition-colors">
                📞 {phone}
              </a>
            )}
            <Link
              href={ctaUrl}
              className="btn-magnetic px-5 py-2.5 rounded-full font-semibold text-sm text-[#00143C] bg-gradient-to-br from-[#C9A84C] to-[#E0C97A] hover:shadow-[0_0_24px_rgba(201,168,76,0.5)] transition-shadow"
            >
              {ctaLabel}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            <div className="w-6 flex flex-col gap-1.5">
              <span className={`block h-[1.5px] bg-white rounded transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[6.5px]' : ''}`} />
              <span className={`block h-[1.5px] bg-white rounded transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-[1.5px] bg-white rounded transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[6.5px]' : ''}`} />
            </div>
          </button>
        </nav>
      </header>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-[999] bg-[#00143C] flex flex-col pt-24 px-8 transition-all duration-500 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {navLinks.map((link, i) => (
          <Link
            key={link.url}
            href={link.url}
            className={`py-5 text-2xl font-medium border-b border-white/10 transition-all duration-300 ${mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
            style={{ transitionDelay: `${i * 80}ms`, color: activeLink === link.url ? '#C9A84C' : 'rgba(255,255,255,0.85)' }}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href={ctaUrl} className="mt-8 py-4 text-center rounded-full bg-gradient-to-br from-[#C9A84C] to-[#E0C97A] text-[#00143C] font-bold" onClick={() => setMobileOpen(false)}>
          {ctaLabel}
        </Link>
      </div>

      <main>{children}</main>

      <Footer data={footerData} />
    </div>
  );
}

function Footer({ data }) {
  const description    = data.description    || "Agence de voyages à Alger spécialisée dans les eVisas en ligne, les voyages Omra et les séjours sur mesure.";
  const phone          = data.phone          || '';
  const email          = data.email          || '';
  const address        = data.address        || 'Alger, Algérie';
  const whatsapp       = data.whatsapp       || '';
  const facebook       = data.facebook       || '';
  const instagram      = data.instagram      || '';
  const agrement       = data.agrement       || 'Agence agréée · Alger, Algérie';
  const copyright      = (data.copyright     || '© {year} Aelia Travel — Tous droits réservés').replace('{year}', new Date().getFullYear());
  const servicesLinks  = data.services_links || [
    { label: 'eVisa en ligne',   url: '/evisa' },
    { label: 'Voyages Omra',     url: '/omra' },
    { label: "Billets d'avion",  url: '/#contact' },
    { label: 'Assurance voyage', url: '/#contact' },
  ];
  const destLinks = data.destinations_links || [
    { label: 'eVisa Turquie',  url: '/evisa' },
    { label: 'eVisa Émirats',  url: '/evisa' },
    { label: 'eVisa Égypte',   url: '/evisa' },
    { label: 'eVisa Jordanie', url: '/evisa' },
  ];

  return (
    <footer className="bg-[#00143C] text-white/60">
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
      <div className="max-w-[1280px] mx-auto px-6 pt-16 pb-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Colonne 1 — Info agence */}
          <div className="md:col-span-1">
            <Logo onDark height="40px" className="mb-4" />
            <div className="w-8 h-px bg-gradient-to-r from-[#C9A84C] to-transparent mb-4" />
            <p className="text-sm leading-relaxed text-white/50">{description}</p>
            {/* Réseaux sociaux */}
            <div className="flex gap-3 mt-4">
              {facebook && <a href={facebook} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#C9A84C] transition-colors text-lg">f</a>}
              {instagram && <a href={instagram} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#C9A84C] transition-colors text-lg">ig</a>}
              {whatsapp && <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-[#C9A84C] transition-colors text-lg">wa</a>}
            </div>
          </div>

          {/* Colonne 2 — Services */}
          <FooterCol title="Services" links={servicesLinks} />

          {/* Colonne 3 — Destinations */}
          <FooterCol title="Destinations populaires" links={destLinks} />

          {/* Colonne 4 — Contact */}
          <div>
            <h5 className="text-white text-xs font-semibold uppercase tracking-[0.15em] mb-5">Contact</h5>
            <div className="space-y-3 text-sm">
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 hover:text-[#C9A84C] transition-colors">
                  <span className="text-[#C9A84C]">📞</span> {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-[#C9A84C] transition-colors">
                  <span className="text-[#C9A84C]">✉</span> {email}
                </a>
              )}
              {address && (
                <span className="flex items-center gap-2">
                  <span className="text-[#C9A84C]">📍</span> {address}
                </span>
              )}
              {whatsapp && (
                <a href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#C9A84C] transition-colors">
                  <span className="text-[#C9A84C]">💬</span> WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/8 flex flex-wrap justify-between items-center gap-4 text-xs text-white/30">
          <p>{copyright}</p>
          <p>{agrement}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
      <h5 className="text-white text-xs font-semibold uppercase tracking-[0.15em] mb-5">{title}</h5>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.url}>
            <a href={l.url} className="text-sm hover:text-[#C9A84C] transition-colors">{l.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
