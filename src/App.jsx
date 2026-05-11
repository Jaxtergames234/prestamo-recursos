import React, { useState, useEffect } from 'react';
import './styles/globals.css';
import TopNav from './components/TopNav';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';

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

import { getCurrentUser, logout } from './data/firebaseService';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'
  const [mode, setMode] = useState({ role: 'admin', page: 'dashboard' });

  useEffect(() => {
    // Verificar usuario autenticado
    const unsubscribe = getCurrentUser().then(u => {
      if (u) {
        setUser(u);
        setMode({ role: u.role, page: u.role === 'admin' ? 'dashboard' : 'inicio' });
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Mostrar pantalla de carga
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-hover) 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: 'white', fontSize: '18px', margin: 0 }}>Cargando...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar login/registro
  if (!user) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  // Manejar logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAuthMode('login');
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Renderizar página según el rol y página seleccionada
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
      <TopNav 
        mode={mode} 
        onModeChange={setMode} 
        user={user} 
        onLogout={handleLogout}
      />
      <main style={{ flex: 1, padding: '24px', maxWidth: '1280px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
        {renderPage()}
      </main>
    </div>
  );
}
