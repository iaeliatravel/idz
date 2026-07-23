import { useEffect, useState } from 'react';
import api from '../../../Utils/adminApi';
import { EmptyState, formatDate, Spinner } from '../Shared/UI';

export default function ContactMessages() {
  const [messages, setMessages] = useState(null);

  function load() {
    api.get('/messages').then(({ data }) => setMessages(data));
  }
  useEffect(load, []);

  if (!messages) return <div className="text-center py-20"><Spinner /></div>;

  async function markRead(m) {
    await api.put(`/messages/${m.id}/read`);
    load();
  }

  return (
    <div className="bg-white rounded-xl border overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 text-xs uppercase">
          <tr><th className="p-3">Nom</th><th className="p-3">Téléphone</th><th className="p-3">Service</th><th className="p-3">Message</th><th className="p-3">Date</th><th className="p-3">Lu</th><th className="p-3"></th></tr>
        </thead>
        <tbody>
          {messages.length ? messages.map((m) => (
            <tr key={m.id} className={`border-t ${!m.is_read ? 'bg-skyblue/[.03] font-semibold' : ''}`}>
              <td className="p-3">{m.first_name} {m.last_name}</td>
              <td className="p-3">{m.phone || '—'}</td>
              <td className="p-3">{m.service || '—'}</td>
              <td className="p-3 max-w-[300px]">{m.message.slice(0, 120)}{m.message.length > 120 ? '...' : ''}</td>
              <td className="p-3">{formatDate(m.created_at)}</td>
              <td className="p-3">{m.is_read ? '✅' : '🔵'}</td>
              <td className="p-3">{!m.is_read && <button onClick={() => markRead(m)} className="text-xs px-3 py-1 border rounded-full">Marquer lu</button>}</td>
            </tr>
          )) : <tr><td colSpan={7}><EmptyState icon="✉" text="Aucun message reçu." /></td></tr>}
        </tbody>
      </table>
    </div>
  );
}
