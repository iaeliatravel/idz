import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { Spinner } from '../Shared/UI';

const VARIANTS = [
  { key: 'color', label: 'Logo couleur', desc: 'Utilisé sur fond clair (pages internes, contenu)', bg: 'bg-gray-50' },
  { key: 'white', label: 'Logo blanc / clair', desc: 'Utilisé sur fond sombre (header transparent, footer navy)', bg: 'bg-navy' },
  { key: 'bw', label: 'Logo noir & blanc', desc: 'Usage print / documents officiels', bg: 'bg-gray-50' },
];

export default function LogosManager() {
  const [logos, setLogos] = useState(null);

  function load() {
    api.get('/logos').then(({ data }) => setLogos(data));
  }
  useEffect(load, []);

  if (!logos) return <div className="text-center py-20"><Spinner /></div>;

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6 max-w-[600px]">
        Téléversez vos 3 versions de logo. Tant qu'une version n'est pas fournie, le site affiche
        automatiquement le texte stylisé « ✈ Aelia Travel » à la place — le site reste donc toujours fonctionnel.
      </p>
      <div className="grid md:grid-cols-3 gap-5">
        {VARIANTS.map((v) => (
          <LogoCard key={v.key} variant={v} url={logos[v.key]} onUpdated={load} />
        ))}
      </div>
    </div>
  );
}

function LogoCard({ variant, url, onUpdated }) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      await api.post(`/logos/${variant.key}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUpdated();
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!confirm('Retirer cette version du logo ? Le texte stylisé sera affiché à la place.')) return;
    await api.delete(`/logos/${variant.key}`);
    onUpdated();
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className={`${variant.bg} h-32 flex items-center justify-center p-4`}>
        {url ? (
          <img src={url} alt={variant.label} className="max-h-full max-w-full object-contain" />
        ) : (
          <span className={variant.key === 'white' ? 'text-white/40 text-sm' : 'text-gray-300 text-sm'}>Aucun logo</span>
        )}
      </div>
      <div className="p-4">
        <h4 className="font-bold text-sm">{variant.label}</h4>
        <p className="text-xs text-gray-400 mt-1 mb-3">{variant.desc}</p>
        <div className="flex gap-2">
          <button
            onClick={() => document.getElementById(`logoInput_${variant.key}`).click()}
            disabled={uploading}
            className="flex-1 py-2 bg-gradient-to-br from-navy to-skyblue text-white rounded-full text-xs font-bold disabled:opacity-50"
          >
            {uploading ? 'Envoi...' : url ? 'Remplacer' : 'Téléverser'}
          </button>
          {url && (
            <button onClick={handleRemove} className="px-3 py-2 border rounded-full text-xs text-red-500">Retirer</button>
          )}
        </div>
        <input
          id={`logoInput_${variant.key}`}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}
