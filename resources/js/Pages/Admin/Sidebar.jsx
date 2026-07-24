import { NavLink } from 'react-router-dom';

const LINKS = [
  { section: null, items: [{ to: '/admin', label: "Vue d'ensemble", icon: '📊', exact: true }] },
  { section: 'eVisa', items: [
    { to: '/admin/evisa/kpis', label: 'KPIs eVisa', icon: '📈' },
    { to: '/admin/evisa/applications', label: 'Demandes', icon: '📥' },
    { to: '/admin/evisa/countries', label: 'Pays', icon: '🌍' },
    { to: '/admin/evisa/options', label: 'Options & Tarifs', icon: '📋' },
  ]},
  { section: 'عمرة / Omra', items: [
    { to: '/admin/omra/kpis', label: 'KPIs Omra', icon: '📈' },
    { to: '/admin/omra/prebookings', label: 'Pré-réservations', icon: '📥' },
    { to: '/admin/omra/simulations', label: 'Simulations', icon: '🧮' },
    { to: '/admin/omra/departures', label: 'Départs / Offres', icon: '✈' },
    { to: '/admin/omra/hotels', label: 'Hôtels', icon: '🏨' },
    { to: '/admin/omra/airlines', label: 'Compagnies aériennes', icon: '🛫' },
    { to: '/admin/omra/partners', label: 'Partenaires', icon: '🤝' },
  ]},
  { section: 'Voyages Organisés', items: [
    { to: '/admin/tours', label: 'Gestion des Voyages', icon: '🌍' },
    { to: '/admin/tour-bookings', label: 'Réservations', icon: '📝' },
  ]},
  { section: 'Demandes clients', items: [
    { to: '/admin/quotes', label: 'Demandes de Devis', icon: '💼' },
    { to: '/admin/messages', label: 'Messages contact', icon: '✉' },
  ]},
  { section: 'Contenu du site', items: [
    { to: '/admin/content/home', label: 'Page Accueil', icon: '🏠' },
    { to: '/admin/content/evisa', label: 'Page eVisa', icon: '🛂' },
    { to: '/admin/content/omra', label: 'Page Omra', icon: '🕌' },
    { to: '/admin/content/header', label: 'En-tête (Header)', icon: '🔝' },  // <-- AJOUTÉ
    { to: '/admin/content/footer', label: 'Pied de page (Footer)', icon: '🔻' },  // <-- AJOUTÉ
    { to: '/admin/logos', label: 'Logo du site', icon: '🖼' },
  ]},
  { section: 'Général', items: [
    { to: '/admin/messages', label: 'Messages contact', icon: '✉' },
    { to: '/admin/settings', label: 'Paramètres', icon: '⚙' },
  ]},
];

export default function Sidebar({ admin, onLogout, mobileOpen, setMobileOpen }) {
  return (
    <>
      <aside className={`fixed top-0 bottom-0 left-0 w-[250px] bg-navy text-white flex flex-col z-[100] overflow-y-auto transition-transform md:translate-x-0 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
          <div>
            <strong className="font-serif text-lg">✈ Aelia Travel</strong>
            <small className="block text-white/50 text-xs mt-1">Dashboard Admin</small>
          </div>
          <button className="md:hidden text-white" onClick={() => setMobileOpen(false)}>✕</button>
        </div>

        <nav className="p-3 flex-1">
          {LINKS.map((group, gi) => (
            <div key={gi}>
              {group.section && (
                <div className="text-[11px] uppercase tracking-wider text-white/35 font-bold px-3 pt-4 pb-1">{group.section}</div>
              )}
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm mb-0.5 transition-colors ${
                      isActive ? 'bg-skyblue/25 text-white font-semibold' : 'text-white/75 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <span>{item.icon}</span> {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-[34px] h-[34px] rounded-full bg-gold text-navy flex items-center justify-center font-bold text-sm flex-shrink-0">
              {admin?.full_name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold">{admin?.full_name}</div>
              <div className="text-xs text-white/45">{admin?.role === 'superadmin' ? 'Super-administrateur' : 'Administrateur'}</div>
            </div>
          </div>
          <button onClick={onLogout} className="w-full py-2 border border-white/30 rounded-full text-sm">↪ Déconnexion</button>
        </div>
      </aside>

      {mobileOpen && <div className="fixed inset-0 bg-black/40 z-[99] md:hidden" onClick={() => setMobileOpen(false)} />}
    </>
  );
}
