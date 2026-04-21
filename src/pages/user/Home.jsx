import React, { useState, useEffect } from 'react';
import { Card, MetricCard, StatusBadge, Badge, Table, Tr, Td } from '../../components/UI';
import { getCurrentUser, getReservations, getLoans, getResources } from '../../data/firebaseService';

export default function UserHome() {
  const [currentUser, setCurrentUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loans, setLoans] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from Firebase
    Promise.all([getCurrentUser(), getReservations(), getLoans(), getResources()]).then(([u, res, l, r]) => {
      setCurrentUser(u || {});
      setReservations(res || []);
      setLoans(l || []);
      setResources(r || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const CURRENT_USER = currentUser;
  const RESERVATIONS = reservations;
  const LOANS = loans;
  const RESOURCES = resources;
  const myReservations = RESERVATIONS.filter(r => r.userId === CURRENT_USER.id && r.status !== 'cancelled').slice(0, 3);
  const myLoans = LOANS.filter(l => l.userId === CURRENT_USER.id && l.status !== 'returned');
  const availableCount = RESOURCES.filter(r => r.status === 'available').length;

  return (
    <div>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-mid) 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '20px',
        color: '#fff',
      }}>
        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bienvenido/a</div>
        <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>{CURRENT_USER.name}</div>
        <div style={{ fontSize: '13px', opacity: 0.85 }}>{CURRENT_USER.department} · {CURRENT_USER.role === 'student' ? 'Estudiante' : 'Docente'}</div>
        <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Recursos disponibles', value: availableCount },
            { label: 'Mis reservas activas', value: myReservations.length },
            { label: 'Préstamos activos', value: myLoans.length },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 'var(--radius-sm)', padding: '10px 16px', backdropFilter: 'blur(4px)' }}>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>{stat.value}</div>
              <div style={{ fontSize: '11px', opacity: 0.85 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Upcoming reservations */}
        <Card>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-secondary)', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Próximas reservas
            {myReservations.length > 0 && <Badge label={myReservations.length} />}
          </div>
          {myReservations.length === 0
            ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>No tienes reservas próximas</div>
            : (
              <div style={{ padding: '8px 0' }}>
                {myReservations.map(r => (
                  <div key={r.id} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-tertiary)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--brand-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      📅
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>{r.resourceName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.date} · {r.startTime}–{r.endTime}</div>
                    </div>
                    <div style={{ background: 'var(--status-available-bg)', color: 'var(--status-available-text)', padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 500 }}>
                      Confirmada
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>

        {/* Active loans */}
        <Card>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-secondary)', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Préstamos activos
            {myLoans.length > 0 && <Badge label={myLoans.length} bg="var(--status-loaned-bg)" color="var(--status-loaned-text)" />}
          </div>
          {myLoans.length === 0
            ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>No tienes préstamos activos</div>
            : (
              <div style={{ padding: '8px 0' }}>
                {myLoans.map(l => (
                  <div key={l.id} style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-tertiary)' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--status-loaned-bg)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                      🔑
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, fontSize: '13px', marginBottom: '2px' }}>{l.resourceName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Vence: {l.dueDate}</div>
                    </div>
                    <div style={{
                      background: l.status === 'overdue' ? 'var(--status-maintenance-bg)' : 'var(--status-loaned-bg)',
                      color: l.status === 'overdue' ? 'var(--status-maintenance-text)' : 'var(--status-loaned-text)',
                      padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 500,
                    }}>
                      {l.status === 'overdue' ? '⚠ Retraso' : 'Activo'}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </Card>
      </div>

      {/* Quick access */}
      <Card style={{ padding: '20px', marginTop: '16px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '14px' }}>Acceso rápido</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
          {[
            { icon: '🏫', label: 'Ver salones', sub: `${RESOURCES.filter(r => r.type === 'salon' && r.status === 'available').length} disponibles`, color: '#E6F1FB' },
            { icon: '🔬', label: 'Ver laboratorios', sub: `${RESOURCES.filter(r => r.type === 'lab' && r.status === 'available').length} disponibles`, color: '#ECFDF5' },
            { icon: '💻', label: 'Ver equipos', sub: `${RESOURCES.filter(r => r.type === 'equipment' && r.status === 'available').length} disponibles`, color: '#EDE9FE' },
            { icon: '📋', label: 'Mis préstamos', sub: `${myLoans.length} activos`, color: '#FEF3C7' },
          ].map(item => (
            <div key={item.label} style={{
              background: item.color,
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
