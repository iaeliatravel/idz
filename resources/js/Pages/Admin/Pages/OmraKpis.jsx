import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { KpiCard, formatDZD, EmptyState, Spinner } from '../Shared/UI';

const STATUS_LABELS = { nouveau: '🆕 Nouveau', contacte: '📞 Contacté', confirme: '✅ Confirmé', annule: '❌ Annulé' };

export default function OmraKpis() {
  const [k, setK] = useState(null);

  useEffect(() => { api.get('/omra/kpis').then(({ data }) => setK(data)); }, []);

  if (!k) return <div className="text-center py-20"><Spinner /></div>;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <KpiCard icon="📥" value={k.totalPb} label="Pré-réservations" color="green" />
        <KpiCard icon="⏱" value={k.nouveauPb} label="Nouvelles" color="gold" />
        <KpiCard icon="✅" value={k.confirme} label="Confirmées" color="green" />
        <KpiCard icon="🧮" value={k.totalSim} label="Simulations effectuées" color="skyblue" />
      </div>
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        <KpiCard icon="💰" value={formatDZD(k.ca)} label="Chiffre d'affaires estimé" color="gold" />
        <KpiCard icon="💵" value={formatDZD(k.benefice)} label="Bénéfice estimé" color="green" />
      </div>
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h4 className="font-bold mb-4">Répartition des pré-réservations par statut</h4>
        {k.byStatus.length ? (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 border-b"><th className="py-2">Statut</th><th>Nombre</th></tr></thead>
            <tbody>{k.byStatus.map((s, i) => (
              <tr key={i} className="border-b last:border-0"><td className="py-2">{STATUS_LABELS[s.status] || s.status}</td><td>{s.cnt}</td></tr>
            ))}</tbody>
          </table>
        ) : <EmptyState text="Aucune donnée" />}
      </div>
      <KpiCard icon="✈" value={k.totalDep} label="Départs actifs publiés" color="navy" />
    </div>
  );
}
