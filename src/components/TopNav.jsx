import React, { useState } from 'react';
import { Avatar } from './UI';
import { LogOut } from 'lucide-react';

const LOGO_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
  </svg>
);

export default function TopNav({ mode, onModeChange, user, onLogout }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'recursos', label: 'Recursos' },
    { id: 'reservas', label: 'Reservas' },
    { id: 'prestamos', label: 'Préstamos' },
    { id: 'usuarios', label: 'Usuarios' },
    { id: 'reportes', label: 'Reportes' },
  ];
  const userTabs = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'catalogo', label: 'Catálogo' },
    { id: 'mis-reservas', label: 'Mis reservas' },
    { id: 'mis-prestamos', label: 'Mis préstamos' },
  ];
  const tabs = mode.role === 'admin' ? adminTabs : userTabs;

  const getUserInitials = () => {
    if (user && user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user && user.name) {
      return user.name;
    }
    if (user && user.email) {
      return user.email.split('@')[0];
    }
    return 'Usuario';
  };

  return (
    <>
      <header style={{
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-secondary)',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        height: '52px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '24px', flexShrink: 0 }}>
          <div style={{
            width: '28px', height: '28px',
            background: 'var(--brand-primary)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {LOGO_ICON}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>GestRes</span>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: '2px', flex: 1 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onModeChange({ ...mode, page: tab.id })}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: mode.page === tab.id ? 500 : 400,
                color: mode.page === tab.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                borderRadius: '6px',
                cursor: 'pointer',
                border: 'none',
                background: mode.page === tab.id ? 'var(--bg-secondary)' : 'transparent',
                fontFamily: 'var(--font)',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >{tab.label}</button>
          ))}
        </nav>

        {/* Right side: user info + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          {/* User info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <Avatar initials={getUserInitials()} />
            <div>
              <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{getUserName()}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                {user && user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid var(--border-secondary)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--bg-secondary)';
              e.currentTarget.style.borderColor = 'var(--border-primary)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'var(--border-secondary)';
            }}
            title="Cerrar sesión"
          >
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-primary)' }}>
              ¿Cerrar sesión?
            </h3>
            <p style={{ margin: '0 0 20px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
              ¿Estás seguro de que deseas cerrar tu sesión?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid var(--border-secondary)',
                  background: 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                style={{
                  padding: '8px 16px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#DC2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#EF4444';
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
