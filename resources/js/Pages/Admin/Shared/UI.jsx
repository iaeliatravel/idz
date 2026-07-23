export function KpiCard({ icon, value, label, color = 'skyblue' }) {
  const colors = {
    skyblue: 'bg-skyblue/10 text-skyblue',
    gold: 'bg-gold/10 text-gold',
    green: 'bg-green/10 text-green',
    navy: 'bg-navy/10 text-navy',
    red: 'bg-red-100 text-red-600',
  };
  return (
    <div className="bg-white rounded-xl border p-6">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-3 ${colors[color]}`}>{icon}</div>
      <div className="text-2xl font-extrabold text-navy">{value}</div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, maxWidth = '640px' }) {
  return (
    <div className="fixed inset-0 z-[2000] bg-navy/55 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 text-xl">&times;</button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </div>
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="flex flex-wrap justify-between items-center gap-4 mb-5">{children}</div>;
}

export function Badge({ children, color = 'blue' }) {
  const colors = {
    green: 'bg-green-100 text-green-700', blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700', purple: 'bg-purple-100 text-purple-700',
    red: 'bg-red-100 text-red-700', navy: 'bg-navy/10 text-navy',
  };
  return <span className={`text-xs font-bold px-2.5 py-1 rounded-full uppercase ${colors[color]}`}>{children}</span>;
}

export function EmptyState({ icon = '📭', text }) {
  return (
    <div className="text-center py-12 text-gray-400">
      <div className="text-4xl mb-3 opacity-50">{icon}</div>
      <p>{text}</p>
    </div>
  );
}

export function IconButton({ children, onClick, danger = false, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-colors ${
        danger ? 'hover:bg-red-100 hover:text-red-600 text-gray-500' : 'hover:bg-skyblue/10 hover:text-skyblue text-gray-500'
      }`}
    >
      {children}
    </button>
  );
}

export function FormField({ label, required, children }) {
  return (
    <div className="mb-4">
      <label className="text-sm font-semibold block mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      {children}
    </div>
  );
}

export const inputClass = "w-full border rounded-lg px-3 py-2 text-sm";

export function formatDZD(amount) {
  return Number(amount || 0).toLocaleString('fr-DZ') + ' DZD';
}

export function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-DZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function Spinner() {
  return <div className="w-10 h-10 border-[3px] border-gray-200 border-t-skyblue rounded-full animate-spin mx-auto" />;
}
