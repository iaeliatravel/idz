import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../../Utils/adminApi';
import { EmptyState, Spinner } from '../Shared/UI';

const PAGE_LABELS = {
  home:   '🏠 Page Accueil',
  evisa:  '🛂 Page eVisa',
  omra:   '🕌 Page Omra',
  header: '🔝 En-tête du site (navigation)',
  footer: '🔻 Pied de page du site',
};

export default function ContentEditor() {
  const { page } = useParams();
  const [sections, setSections] = useState(null);
  const [savingKey, setSavingKey] = useState(null);
  const [savedKey, setSavedKey] = useState(null);

  function load() {
    api.get(`/content/${page}`).then(({ data }) => setSections(data));
  }
  useEffect(load, [page]);

  if (!sections) return <div className="text-center py-20"><Spinner /></div>;

  async function handleSave(section, newContent, isActive) {
    setSavingKey(section.section_key);
    try {
      await api.put(`/content/${page}/${section.section_key}`, {
        content: newContent,
        is_active: isActive,
        display_order: section.display_order,
      });
      setSavedKey(section.section_key);
      setTimeout(() => setSavedKey(null), 2000);
      load();
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div>
      <h3 className="text-lg font-bold mb-1">{PAGE_LABELS[page] || page}</h3>
      <p className="text-sm text-gray-500 mb-6">
        {page === 'header' && "Modifiez le numéro de téléphone, le bouton CTA, et les liens de navigation affichés dans l'en-tête."}
        {page === 'footer' && "Modifiez toutes les informations du pied de page : coordonnées, réseaux sociaux, liens, copyright."}
        {(page === 'home' || page === 'evisa' || page === 'omra') && "Modifiez les textes, images et listes de chaque section. Les changements sont visibles immédiatement sur le site."}
      </p>

      {sections.length ? (
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionEditor
              key={section.section_key}
              section={section}
              saving={savingKey === section.section_key}
              saved={savedKey === section.section_key}
              onSave={handleSave}
            />
          ))}
        </div>
      ) : (
        <div>
          <EmptyState icon="📝" text="Aucune section configurée. Initialisez les données par défaut :" />
          <div className="mt-4 bg-gray-50 rounded-xl p-4 text-sm font-mono text-gray-600">
            {page === 'header' && 'php artisan db:seed --class=HeaderFooterSeeder'}
            {page === 'footer' && 'php artisan db:seed --class=HeaderFooterSeeder'}
            {(page === 'home' || page === 'evisa' || page === 'omra') && 'php artisan db:seed --class=SiteContentSeeder'}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionEditor({ section, saving, saved, onSave }) {
  const [open, setOpen] = useState(true); // ouvert par défaut pour header/footer (une seule section)
  const [content, setContent] = useState(section.content);
  const [isActive, setIsActive] = useState(section.is_active);

  function setField(key, value) {
    setContent({ ...content, [key]: value });
  }

  function setArrayItemField(arrayKey, index, field, value) {
    const arr = [...(content[arrayKey] || [])];
    arr[index] = { ...arr[index], [field]: value };
    setContent({ ...content, [arrayKey]: arr });
  }

  function addArrayItem(arrayKey) {
    const existing = content[arrayKey] || [];
    const template = existing[0]
      ? Object.keys(existing[0]).reduce((acc, k) => ({ ...acc, [k]: '' }), {})
      : { label: '', url: '' };
    setContent({ ...content, [arrayKey]: [...existing, template] });
  }

  function removeArrayItem(arrayKey, index) {
    const arr = [...(content[arrayKey] || [])];
    arr.splice(index, 1);
    setContent({ ...content, [arrayKey]: arr });
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex justify-between items-center px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <span className="font-bold capitalize">{section.section_key.replace(/_/g, ' ')}</span>
          {!isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Masquée</span>}
          {saved && <span className="text-green-600 text-xs font-bold">✓ Enregistré</span>}
        </div>
        <span className="text-gray-400">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold flex items-center gap-2">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Section visible sur le site
            </label>
          </div>

          {Object.entries(content).map(([key, value]) => (
            <FieldEditor
              key={key}
              fieldKey={key}
              value={value}
              onChange={(v) => setField(key, v)}
              onArrayItemChange={(i, f, v) => setArrayItemField(key, i, f, v)}
              onAddItem={() => addArrayItem(key)}
              onRemoveItem={(i) => removeArrayItem(key, i)}
            />
          ))}

          <button
            disabled={saving}
            onClick={() => onSave(section, content, isActive)}
            className="px-6 py-2.5 bg-gradient-to-br from-[#00143C] to-[#0F2D5C] text-white rounded-full font-bold text-sm disabled:opacity-50 mt-2"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer cette section'}
          </button>
        </div>
      )}
    </div>
  );
}

function FieldEditor({ fieldKey, value, onChange, onArrayItemChange, onAddItem, onRemoveItem }) {
  const label = fieldKey.replace(/_/g, ' ');
  const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition-all';

  // Liste d'objets (nav_links, services_links, destinations_links, items...)
  if (Array.isArray(value) && value.length && typeof value[0] === 'object') {
    return (
      <div className="mb-5">
        <label className="text-sm font-bold block mb-2 capitalize">{label}</label>
        <div className="space-y-2">
          {value.map((item, i) => (
            <div key={i} className="border rounded-lg p-3 bg-gray-50">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(item).map(([k, v]) => (
                  <div key={k}>
                    <label className="text-xs text-gray-400 block mb-0.5 capitalize">{k.replace(/_/g, ' ')}</label>
                    <input value={v || ''} onChange={(e) => onArrayItemChange(i, k, e.target.value)} className={inputClass} />
                  </div>
                ))}
              </div>
              <button onClick={() => onRemoveItem(i)} className="text-xs text-red-500 mt-2">Retirer</button>
            </div>
          ))}
        </div>
        <button onClick={onAddItem} className="text-sm px-3 py-1.5 border rounded-full mt-2">+ Ajouter un élément</button>
      </div>
    );
  }

  // Liste de chaînes simples
  if (Array.isArray(value)) {
    return (
      <div className="mb-4">
        <label className="text-sm font-bold block mb-1 capitalize">{label}</label>
        <input value={value.join(', ')} onChange={(e) => onChange(e.target.value.split(',').map((s) => s.trim()))} placeholder="Séparez par des virgules" className={inputClass} />
      </div>
    );
  }

  // Objet imbriqué
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="mb-5">
        <label className="text-sm font-bold block mb-2 capitalize">{label}</label>
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg">
          {Object.entries(value).map(([k, v]) => (
            <div key={k}>
              <label className="text-xs text-gray-400 block mb-0.5">{k}</label>
              <input value={v || ''} onChange={(e) => onChange({ ...value, [k]: e.target.value })} className={inputClass} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Texte long → textarea
  if (typeof value === 'string' && (value.includes('\n') || value.length > 100)) {
    return (
      <div className="mb-4">
        <label className="text-sm font-bold block mb-1 capitalize">{label}</label>
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={inputClass} />
      </div>
    );
  }

  // Champ simple
  return (
    <div className="mb-4">
      <label className="text-sm font-bold block mb-1 capitalize">{label}</label>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </div>
  );
}
