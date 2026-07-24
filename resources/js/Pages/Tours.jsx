import { Head, Link } from '@inertiajs/react';
import MainLayout from '../Layouts/MainLayout';

export default function Tours({ tours }) {
  return (
    <MainLayout alwaysSolid>
      <Head title="Voyages Organisés & Circuits — Aelia Travel" />

      {/* Hero Header */}
      <section className="relative bg-[#00143C] pt-28 pb-12 overflow-hidden text-center">
        <div className="absolute inset-0 opacity-15"
          style={{ background: 'radial-gradient(circle at 50% 50%, #C9A84C 0%, transparent 60%)' }} />
        <div className="relative z-10 max-w-[1280px] mx-auto px-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-[#C9A84C] text-xs font-semibold uppercase tracking-[0.15em] mb-4">
            🌍 Évadez-vous avec nous
          </span>
          <h1 className="text-white text-3xl md:text-5xl font-bold mb-3">Nos Voyages Organisés</h1>
          <p className="text-white/60 max-w-[500px] mx-auto text-sm">
            Découvrez nos circuits tout compris : vols, hôtels, visites et accompagnement complet pour des séjours inoubliables.
          </p>
        </div>
      </section>

      {/* Liste des voyages */}
      <section className="py-16 bg-[#F7F5F0] min-h-[60vh]">
        <div className="max-w-[1280px] mx-auto px-6">
          {!tours.length ? (
            <div className="text-center py-20 text-gray-400">Aucun voyage organisé disponible pour le moment.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tours.map((t, idx) => {
                const fallbackImage = `https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop`;
                return (
                  <div key={t.id} className="bg-white rounded-[24px] border border-[#EDE9E0] overflow-hidden shadow-soft transition-transform duration-300 hover:-translate-y-1.5 flex flex-col h-full">
                    {/* Image de couverture */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <img src={t.cover_image_url || fallbackImage} className="w-full h-full object-cover" alt={t.title_fr} />
                      <div className="absolute bottom-3 left-3 bg-[#00143C] text-[#C9A84C] font-bold text-xs px-3 py-1 rounded-full">
                        📍 {t.destination}
                      </div>
                    </div>

                    {/* Contenu de la carte */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-[#00143C] text-lg mb-2">{t.title_fr}</h4>
                        <div className="text-xs text-[#8892A4] space-y-1.5 mb-4">
                          <div className="flex items-center gap-1.5">⏱ Départ : {new Date(t.departure_date).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                          <div className="flex items-center gap-1.5">🗓 Retour : {new Date(t.return_date).toLocaleDateString('fr-DZ', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                        </div>
                      </div>

                      <div className="border-t border-[#F7F5F0] pt-4 flex items-center justify-between">
                        <div>
                          <div className="text-xs text-[#8892A4]">À partir de</div>
                          <div className="text-navy font-bold text-lg mono">{Number(t.price_dzd).toLocaleString('fr-DZ')} <span className="text-xs">DZD</span></div>
                        </div>
                        <Link href={`/voyages/${t.slug}`} className="px-5 py-2.5 bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-white font-bold text-xs rounded-full transition-shadow hover:shadow-card">
                          Voir l'offre →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}