import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { KpiCard, formatDZD, EmptyState, Spinner } from '../Shared/UI';

const STATUS_LABELS = {
  nouveau: '🆕 Nouveau', en_cours: '⏳ En cours', documents_manquants: '📋 Documents manquants',
  soumis_ambassade: '🏛 Soumis ambassade', approuve: '✅ Approuvé', refuse: '❌ Refusé', annule: '🚫 Annulé',
};

export default function EvisaKpis() {
  const [k, setK] = useState(null);

  useEffect(() => { api.get('/evisa/kpis').then(({ data }) => setK(data)); }, []);

  if (!k) return <div className="text-center py-20"><Spinner /></div>;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <KpiCard icon="📥" value={k.total} label="Total demandes" color="skyblue" />
        <KpiCard icon="⏱" value={k.nouveau} label="Nouvelles demandes" color="gold" />
        <KpiCard icon="✅" value={k.approuve} label="Approuvées" color="green" />
        <KpiCard icon="💰" value={formatDZD(k.ca)} label="Chiffre d'affaires" color="gold" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <KpiCard icon="💵" value={formatDZD(k.benefice)} label="Bénéfice estimé total" color="green" />
        <div className="bg-white rounded-xl border p-6">
          <h4 className="font-bold mb-4">Répartition par statut</h4>
          {k.byStatus.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 border-b"><th className="py-2">Statut</th><th>Nombre</th></tr></thead>
              <tbody>{k.byStatus.map((s, i) => (
                <tr key={i} className="border-b last:border-0"><td className="py-2">{STATUS_LABELS[s.status] || s.status}</td><td>{s.cnt}</td></tr>
              ))}</tbody>
            </table>
          ) : <EmptyState text="Aucune donnée" />}
        </div>
      </div>
      <div className="bg-white rounded-xl border p-6 mt-6">
        <h4 className="font-bold mb-4">Top 5 pays les plus demandés</h4>
        {k.topCountries.length ? (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 border-b"><th className="py-2">Pays</th><th>Demandes</th></tr></thead>
            <tbody>{k.topCountries.map((c, i) => (
              <tr key={i} className="border-b last:border-0"><td className="py-2">{c.name_fr}</td><td>{c.cnt}</td></tr>
            ))}</tbody>
          </table>
        ) : <EmptyState text="Aucune donnée" />}
      </div>
    </div>
  );
}
