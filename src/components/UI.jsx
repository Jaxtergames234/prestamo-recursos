import React, { useState, useEffect } from 'react';
import { STATUS_LABELS, STATUS_COLORS } from '../data/mockData';

// ─── BADGE ────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const colors = STATUS_COLORS[status] || { bg: '#f3f4f6', text: '#374151' };
  return (
    <span style={{
      background: colors.bg,
      color: colors.text,
      padding: '2px 10px',
      borderRadius: '99px',
      fontSize: '12px',
      fontWeight: 500,
      display: 'inline-block',
      whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

// ─── GENERIC BADGE ────────────────────────────────────────────────
export function Badge({ label, bg = '#E6F1FB', color = '#185FA5' }) {
  return (
    <span style={{
      background: bg, color, padding: '2px 10px',
      borderRadius: '99px', fontSize: '12px', fontWeight: 500,
      display: 'inline-block', whiteSpace: 'nowrap',
    }}>{label}</span>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────
export function Btn({ children, variant = 'default', size = 'md', onClick, disabled, type = 'button', style = {} }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    border: 'none', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font)',
    fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s', opacity: disabled ? 0.5 : 1,
    padding: size === 'sm' ? '5px 12px' : size === 'lg' ? '10px 20px' : '7px 15px',
    fontSize: size === 'sm' ? '12px' : '13px',
    ...style,
  };
  const variants = {
    default: { background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' },
    primary: { background: 'var(--brand-primary)', color: '#fff', border: '1px solid var(--brand-primary)' },
    danger: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FECACA' },
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
    success: { background: '#DCFCE7', color: '#166534', border: '1px solid #BBF7D0' },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}

// ─── CARD ─────────────────────────────────────────────────────────
export function Card({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--bg-primary)',
      border: '1px solid var(--border-secondary)',
      borderRadius: 'var(--radius-md)',
      ...style,
    }}>{children}</div>
  );
}

// ─── METRIC CARD ──────────────────────────────────────────────────
export function MetricCard({ label, value, change, changeType }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      border: '1px solid var(--border-tertiary)',
    }}>
      <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '26px', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</div>
      {change && (
        <div style={{ fontSize: '11px', color: changeType === 'up' ? '#166534' : changeType === 'dn' ? '#991B1B' : 'var(--text-secondary)', marginTop: '3px' }}>
          {change}
        </div>
      )}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, footer }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!open) return null;
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.45)',
        backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: '20px',
      }}>
      <div style={{
        background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflow: 'auto',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
        {footer && <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-secondary)', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>{footer}</div>}
      </div>
    </div>
  );
}

// ─── FORM FIELD ───────────────────────────────────────────────────
export function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border-primary)', background: 'var(--bg-primary)',
  color: 'var(--text-primary)', fontSize: '13px', outline: 'none',
  transition: 'border-color 0.15s',
};

export function Input(props) {
  return <input style={inputStyle} {...props} />;
}

export function Select({ children, ...props }) {
  return <select style={{ ...inputStyle, cursor: 'pointer' }} {...props}>{children}</select>;
}

export function Textarea(props) {
  return <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} {...props} />;
}

// ─── TOAST ────────────────────────────────────────────────────────
export function Toast({ message, type = 'success', visible }) {
  const colors = {
    success: { bg: '#166534', icon: '✓' },
    error: { bg: '#991B1B', icon: '✕' },
    info: { bg: '#1E40AF', icon: 'ℹ' },
  };
  const c = colors[type] || colors.success;
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      background: c.bg, color: '#fff',
      padding: '10px 18px', borderRadius: 'var(--radius-md)',
      display: 'flex', alignItems: 'center', gap: '10px',
      fontSize: '13px', fontWeight: 500,
      boxShadow: 'var(--shadow-md)',
      transform: visible ? 'translateY(0)' : 'translateY(80px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.3s cubic-bezier(.34,1.56,.64,1)',
      zIndex: 2000, pointerEvents: 'none',
    }}>
      <span style={{ fontSize: '14px' }}>{c.icon}</span>
      {message}
    </div>
  );
}

// ─── TABLE ────────────────────────────────────────────────────────
export function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 14px', textAlign: 'left',
                fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: '1px solid var(--border-secondary)',
                background: 'var(--bg-secondary)',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid var(--border-tertiary)',
        transition: 'background 0.1s',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >{children}</tr>
  );
}

export function Td({ children, style = {} }) {
  return <td style={{ padding: '10px 14px', color: 'var(--text-primary)', verticalAlign: 'middle', ...style }}>{children}</td>;
}

// ─── EMPTY STATE ─────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
      <div style={{ fontSize: '36px', marginBottom: '12px' }}>{icon}</div>
      <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '13px' }}>{subtitle}</div>
    </div>
  );
}

// ─── SEARCH BAR ──────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ position: 'absolute', left: '10px', color: 'var(--text-tertiary)', fontSize: '13px', pointerEvents: 'none' }}>🔍</span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          paddingLeft: '32px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px',
          border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-primary)', color: 'var(--text-primary)',
          fontSize: '13px', outline: 'none', width: '220px',
        }}
      />
    </div>
  );
}

// ─── PAGE HEADER ─────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─── FILTER CHIPS ─────────────────────────────────────────────────
export function FilterChips({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
            border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
            background: value === opt.value ? 'var(--brand-primary)' : 'var(--bg-primary)',
            color: value === opt.value ? '#fff' : 'var(--text-secondary)',
            borderColor: value === opt.value ? 'var(--brand-primary)' : 'var(--border-primary)',
          }}
        >{opt.label}</button>
      ))}
    </div>
  );
}

// ─── AVATAR ──────────────────────────────────────────────────────
export function Avatar({ initials, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--brand-soft)', color: 'var(--brand-hover)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 600, flexShrink: 0,
    }}>{initials}</div>
  );
}
