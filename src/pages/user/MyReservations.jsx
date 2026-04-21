import React, { useState, useEffect } from 'react';
import { getReservations, getCurrentUser } from '../../data/firebaseService';
import { PageHeader, FilterChips, Card, Table, Tr, Td, Btn, EmptyState, Toast } from '../../components/UI';
import { useToast } from '../../utils/useToast';

const STATUS_OPTS = [
  { value: 'all', label: 'Todas' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
];

const STATUS_STYLE = {
  confirmed: { bg: 'var(--status-available-bg)', color: 'var(--status-available-text)', label: 'Confirmada' },
  pending: { bg: 'var(--status-reserved-bg)', color: 'var(--status-reserved-text)', label: 'Pendiente' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280', label: 'Cancelada' },
};

export default function UserReservations() {
  const [reservations, setReservations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load data from Firebase
    Promise.all([getReservations(), getCurrentUser()]).then(([r, u]) => {
      setReservations(r || []);
      setCurrentUser(u || {});
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const RESERVATIONS = reservations;
  const CURRENT_USER = currentUser;

  const filtered = statusFilter === 'all' ? reservations : reservations.filter(r => r.status === statusFilter);

  function handleCancel(id) {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    showToast('Reserva cancelada', 'info');
  }

  const confirmedCount = reservations.filter(r => r.status === 'confirmed').length;
  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div>
      <PageHeader
        title="Mis reservas"
        subtitle={`${confirmedCount} confirmadas · ${pendingCount} pendientes`}
      />

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Confirmadas', value: confirmedCount, bg: 'var(--status-available-bg)', color: 'var(--status-available-text)' },
          { label: 'Pendientes', value: pendingCount, bg: 'var(--status-reserved-bg)', color: 'var(--status-reserved-text)' },
          { label: 'Total reservas', value: reservations.length, bg: 'var(--brand-light)', color: 'var(--brand-primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: s.color, opacity: 0.8, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ padding: '12px 16px', marginBottom: '14px' }}>
        <FilterChips options={STATUS_OPTS} value={statusFilter} onChange={setStatusFilter} />
      </Card>

      <Card>
        {filtered.length === 0
          ? <EmptyState icon="📅" title="Sin reservas" subtitle="No tienes reservas para este filtro." />
          : (
            <Table headers={['Recurso', 'Fecha', 'Horario', 'Propósito', 'Estado', 'Acciones']}>
              {filtered.map(r => {
                const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                return (
                  <Tr key={r.id}>
                    <Td><strong style={{ fontWeight: 500 }}>{r.resourceName}</strong></Td>
                    <Td><span className="mono">{r.date}</span></Td>
                    <Td><span className="mono">{r.startTime}–{r.endTime}</span></Td>
                    <Td style={{ color: 'var(--text-secondary)' }}>{r.purpose}</Td>
                    <Td>
                      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{s.label}</span>
                    </Td>
                    <Td>
                      {r.status !== 'cancelled' && (
                        <Btn size="sm" variant="danger" onClick={() => handleCancel(r.id)}>Cancelar</Btn>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          )}
      </Card>

      <Toast {...toast} />
    </div>
  );
}
