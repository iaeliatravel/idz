import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../../Utils/adminApi';
import Sidebar from './Sidebar';
import Login from './Login';
import { Spinner } from './Shared/UI';
import Overview from './Pages/Overview';
import EvisaKpis from './Pages/EvisaKpis';
import EvisaApplications from './Pages/EvisaApplications';
import EvisaCountries from './Pages/EvisaCountries';
import EvisaOptions from './Pages/EvisaOptions';
import OmraKpis from './Pages/OmraKpis';
import OmraPrebookings from './Pages/OmraPrebookings';
import OmraSimulations from './Pages/OmraSimulations';
import OmraDepartures from './Pages/OmraDepartures';
import OmraHotels from './Pages/OmraHotels';
import OmraAirlines from './Pages/OmraAirlines';
import OmraPartners from './Pages/OmraPartners';
import ContentEditor from './Pages/ContentEditor';
import LogosManager from './Pages/LogosManager';
import ContactMessages from './Pages/ContactMessages';
import Settings from './Pages/Settings';

// ---- IMPORTS DES 3 NOUVELLES PAGES ----
import ToursManager from './Pages/ToursManager';
import TourBookings from './Pages/TourBookings';
import QuotesManager from './Pages/QuotesManager';

export { Spinner };

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    api.get('/me')
      .then(({ data }) => setAdmin(data))
      .catch(() => setAdmin(null))
      .finally(() => setChecked(true));
  }, []);

  if (!checked) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <BrowserRouter>
      {!admin ? (
        <Login onLogin={setAdmin} />
      ) : (
        <Shell admin={admin} setAdmin={setAdmin} />
      )}
    </BrowserRouter>
  );
}

function Shell({ admin, setAdmin }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await axios.post('/api/admin/logout');
    setAdmin(null);
    navigate('/admin');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar admin={admin} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <main className="flex-1 md:ml-[250px]">
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-xl" onClick={() => setMobileOpen(true)}>☰</button>
            <h2 className="text-xl font-bold">Dashboard</h2>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="px-4 py-2 border rounded-full text-sm">Voir le site ↗</a>
        </div>
        <div className="p-6">
          <Routes>
            <Route path="/admin" element={<Overview />} />
            <Route path="/admin/evisa/kpis" element={<EvisaKpis />} />
            <Route path="/admin/evisa/applications" element={<EvisaApplications />} />
            <Route path="/admin/evisa/countries" element={<EvisaCountries />} />
            <Route path="/admin/evisa/options" element={<EvisaOptions />} />
            <Route path="/admin/omra/kpis" element={<OmraKpis />} />
            <Route path="/admin/omra/prebookings" element={<OmraPrebookings />} />
            <Route path="/admin/omra/simulations" element={<OmraSimulations />} />
            <Route path="/admin/omra/departures" element={<OmraDepartures />} />
            <Route path="/admin/omra/hotels" element={<OmraHotels />} />
            <Route path="/admin/omra/airlines" element={<OmraAirlines />} />
            <Route path="/admin/omra/partners" element={<OmraPartners />} />
            
            {/* ---- 3 NOUVELLES ROUTES ENREGISTRÉES ICI ---- */}
            <Route path="/admin/tours" element={<ToursManager />} />
            <Route path="/admin/tour-bookings" element={<TourBookings />} />
            <Route path="/admin/quotes" element={<QuotesManager />} />

            <Route path="/admin/content/:page" element={<ContentEditor />} />
            <Route path="/admin/logos" element={<LogosManager />} />
            <Route path="/admin/messages" element={<ContactMessages />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}