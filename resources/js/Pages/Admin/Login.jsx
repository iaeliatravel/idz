import { useState } from 'react';
import api from '../../Utils/adminApi';
import Logo from '../../Components/Logo';

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/login', form);
      onLogin(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy to-skyblue">
      <div className="bg-white rounded-2xl p-11 w-full max-w-[400px] shadow-2xl">
        <div className="text-center mb-7">
          <Logo height="40px" className="mx-auto" />
          <small className="block text-gray-400 text-sm mt-2">Dashboard Administrateur</small>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-sm font-semibold block mb-1">Email</label>
            <input
              type="email" required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="admin@aeliatravelagency.dz"
              className="w-full border rounded-lg px-4 py-2.5"
            />
          </div>
          <div className="mb-6">
            <label className="text-sm font-semibold block mb-1">Mot de passe</label>
            <input
              type="password" required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full border rounded-lg px-4 py-2.5"
            />
          </div>
          <button disabled={loading} className="w-full py-3.5 bg-gradient-to-br from-navy to-skyblue text-white rounded-full font-bold disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          {error && <p className="text-red-600 text-sm text-center mt-4">{error}</p>}
        </form>
      </div>
    </div>
  );
}
