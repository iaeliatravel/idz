import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { KpiCard, formatDZD, EmptyState, Spinner } from '../Shared/UI';

const STATUS_LABELS_OMRA = { nouveau: '🆕 Nouveau', contacte: '📞 Contacté', confirme: '✅ Confirmé', annule: '❌ Annulé' };

export default function Overview() {
  const [evisaKpis, setEvisaKpis] = useState(null);
  const [omraKpis, setOmraKpis] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/evisa/kpis'), api.get('/omra/kpis')]).then(([e, o]) => {
      setEvisaKpis(e.data);
      setOmraKpis(o.data);
    });
  }, []);

  if (!evisaKpis || !omraKpis) {
    return <div className="text-center py-20"><Spinner /></div>;
  }

  const totalCA = Number(evisaKpis.ca) + Number(omraKpis.ca);
  const totalBenefice = Number(evisaKpis.benefice) + Number(omraKpis.benefice);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        <KpiCard icon="🛂" value={evisaKpis.total} label="Demandes eVisa" color="skyblue" />
        <KpiCard icon="🕌" value={omraKpis.totalPb} label="Pré-réservations Omra" color="green" />
        <KpiCard icon="💰" value={formatDZD(totalCA)} label="Chiffre d'affaires total" color="gold" />
        <KpiCard icon="💵" value={formatDZD(totalBenefice)} label="Bénéfice total estimé" color="green" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h4 className="font-bold mb-4">🛂 Demandes eVisa — Top pays</h4>
          {evisaKpis.topCountries.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 border-b"><th className="py-2">Pays</th><th>Demandes</th></tr></thead>
              <tbody>
                {evisaKpis.topCountries.map((c, i) => (
                  <tr key={i} className="border-b last:border-0"><td className="py-2">{c.name_fr}</td><td>{c.cnt}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState text="Aucune donnée pour le moment." />}
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h4 className="font-bold mb-4">🕌 Pré-réservations Omra — par statut</h4>
          {omraKpis.byStatus.length ? (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 border-b"><th className="py-2">Statut</th><th>Nombre</th></tr></thead>
              <tbody>
                {omraKpis.byStatus.map((s, i) => (
                  <tr key={i} className="border-b last:border-0"><td className="py-2">{STATUS_LABELS_OMRA[s.status] || s.status}</td><td>{s.cnt}</td></tr>
                ))}
              </tbody>
            </table>
          ) : <EmptyState text="Aucune donnée pour le moment." />}
        </div>
      </div>
    </div>
  );
}
