
import React, { useState, useEffect } from 'react';
import './styles/globals.css';
import TopNav from './components/TopNav';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminResources from './pages/admin/Resources';
import AdminReservations from './pages/admin/Reservations';
import AdminLoans from './pages/admin/Loans';
import AdminUsers from './pages/admin/Users';
import AdminReports from './pages/admin/Reports';

// User pages
import UserHome from './pages/user/Home';
import UserCatalog from './pages/user/Catalog';
import UserReservations from './pages/user/MyReservations';
import UserLoans from './pages/user/MyLoans';

import { getCurrentUser } from './data/firebaseService';

export default function App() {
  const [mode, setMode] = useState({ role: 'admin', page: 'dashboard' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load current user from Firebase
    getCurrentUser().then(u => {
      if (u) setUser(u);
      else {
        // Fallback user when Firebase not configured
        setUser({ id: 'temp', name: 'Usuario', email: 'user@example.com', role: 'admin' });
      }
    });
  }, []);

  if (!user) return <div style={{ padding: '20px' }}>Cargando...</div>;

  function renderPage() {
    if (mode.role === 'admin') {
      switch (mode.page) {
        case 'dashboard':   return <AdminDashboard />;
        case 'recursos':    return <AdminResources />;
        case 'reservas':    return <AdminReservations />;
        case 'prestamos':   return <AdminLoans />;
        case 'usuarios':    return <AdminUsers />;
        case 'reportes':    return <AdminReports />;
        default:            return <AdminDashboard />;
      }
    } else {
      switch (mode.page) {
        case 'inicio':         return <UserHome />;
        case 'catalogo':       return <UserCatalog />;
        case 'mis-reservas':   return <UserReservations />;
        case 'mis-prestamos':  return <UserLoans />;
        default:               return <UserHome />;
      }
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-tertiary)' }}>
      <TopNav mode={mode} onModeChange={setMode} user={user} />
      <main style={{ flex: 1, padding: '24px', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {renderPage()}
      </main>
    </div>
  );
}
