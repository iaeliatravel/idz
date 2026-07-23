import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { FormField, inputClass, Spinner } from '../Shared/UI';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { api.get('/settings').then(({ data }) => setSettings(data)); }, []);

  if (!settings) return <div className="text-center py-20"><Spinner /></div>;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-[560px]">
      <div className="bg-white rounded-xl border p-6">
        <h3 className="font-bold mb-5">Paramètres généraux</h3>
        <form onSubmit={handleSubmit}>
          <FormField label="Email d'alerte (nouvelles inscriptions)">
            <input
              value={settings.alert_email || ''}
              onChange={(e) => setSettings({ ...settings, alert_email: e.target.value })}
              placeholder="contact@aeliatravelagency.dz"
              className={inputClass}
            />
          </FormField>
          <FormField label="Nom du site">
            <input
              value={settings.site_name || ''}
              onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
              className={inputClass}
            />
          </FormField>
          <button disabled={saving} className="w-full py-3 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
            {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}
