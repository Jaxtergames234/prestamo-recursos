import React from 'react';
import { Avatar } from './UI';

const LOGO_ICON = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.9"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.7"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="white" opacity="0.5"/>
  </svg>
);

export default function TopNav({ mode, onModeChange, user }) {
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

  return (
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

      {/* Right side: role switcher + user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Role switcher (demo only) */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)',
          borderRadius: '6px', padding: '2px', gap: '1px',
          border: '1px solid var(--border-secondary)',
        }}>
          {[
            { role: 'user', label: 'Usuario' },
            { role: 'admin', label: 'Admin' },
          ].map(r => (
            <button
              key={r.role}
              onClick={() => onModeChange({ role: r.role, page: r.role === 'admin' ? 'dashboard' : 'inicio' })}
              style={{
                padding: '3px 10px', fontSize: '11px', fontWeight: 500,
                borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: mode.role === r.role ? 'var(--brand-primary)' : 'transparent',
                color: mode.role === r.role ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >{r.label}</button>
          ))}
        </div>

        {/* User pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <Avatar initials={user.avatar} />
          <span style={{ fontWeight: 500 }}>{user.name}</span>
        </div>
      </div>
    </header>
  );
}
