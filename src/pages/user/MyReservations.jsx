import React, { useState, useEffect } from 'react';
import { getReservations, getCurrentUser, cancelReservation } from '../../data/firebaseService';
import { PageHeader, FilterChips, Card, Table, Tr, Td, Btn, EmptyState, Toast } from '../../components/UI';
import { useToast } from '../../utils/useToast';

const STATUS_OPTS = [
  { value: 'all', label: 'Todas' },
  { value: 'confirmed', label: 'Confirmadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
];

const STATUS_STYLE = {
  confirmed: { bg: 'var(--status-available-bg)', color: 'var(--status-available-text)', label: '✓ Confirmada' },
  pending: { bg: 'var(--status-reserved-bg)', color: 'var(--status-reserved-text)', label: '⏳ Pendiente' },
  cancelled: { bg: '#F3F4F6', color: '#6B7280', label: '✕ Cancelada' },
};

export default function UserReservations() {
  const [reservations, setReservations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load data from Firebase
    Promise.all([getReservations(), getCurrentUser()]).then(([r, u]) => {
      setReservations(r || []);
      setCurrentUser(u || {});
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>⏳ Cargando...</div>;

  const CURRENT_USER = currentUser;

  // Filter reservations by current user
  const userReservations = reservations.filter(r => r.userId === CURRENT_USER?.id || r.userName === CURRENT_USER?.name);
  const filtered = statusFilter === 'all' ? userReservations : userReservations.filter(r => r.status === statusFilter);

  async function handleCancel(id) {
    setCancelling(id);
    try {
      await cancelReservation(id, 'Cancelada por el usuario');
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      showToast('✓ Reserva cancelada', 'info');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      showToast('Error al cancelar la reserva', 'error');
    } finally {
      setCancelling(null);
    }
  }

  const confirmedCount = userReservations.filter(r => r.status === 'confirmed').length;
  const pendingCount = userReservations.filter(r => r.status === 'pending').length;
  const activeCount = userReservations.filter(r => r.status !== 'cancelled').length;

  return (
    <div>
      <PageHeader
        title="Mis reservas"
        subtitle={`${activeCount} activas · ${pendingCount} por aprobar`}
      />

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Confirmadas', value: confirmedCount, bg: 'var(--status-available-bg)', color: 'var(--status-available-text)' },
          { label: 'Pendientes', value: pendingCount, bg: 'var(--status-reserved-bg)', color: 'var(--status-reserved-text)' },
          { label: 'Total reservas', value: userReservations.length, bg: 'var(--brand-light)', color: 'var(--brand-primary)' },
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
          ? <EmptyState 
              icon="📅" 
              title="Sin reservas" 
              subtitle={statusFilter === 'all' 
                ? "No tienes reservas aún. Ve al catálogo para hacer una."
                : `No tienes reservas ${statusFilter === 'confirmed' ? 'confirmadas' : statusFilter === 'pending' ? 'pendientes' : 'canceladas'}.`}
            />
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
                      <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>
                        {s.label}
                      </span>
                    </Td>
                    <Td>
                      {r.status !== 'cancelled' && (
                        <Btn 
                          size="sm" 
                          variant="danger" 
                          onClick={() => handleCancel(r.id)}
                          disabled={cancelling === r.id}
                        >
                          {cancelling === r.id ? '⏳ Cancelando...' : '✕ Cancelar'}
                        </Btn>
                      )}
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          )}
      </Card>

      <Card style={{ padding: '14px 16px', marginTop: '16px', background: 'var(--brand-light)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ fontSize: '13px', color: 'var(--brand-primary)', lineHeight: '1.5' }}>
          <strong>ℹ️ Información sobre tus reservas:</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px', opacity: 0.8 }}>
            <li>Las reservas pendientes necesitan ser confirmadas por un administrador</li>
            <li>Las reservas confirmadas están aseguradas para el día y hora especificados</li>
            <li>Puedes cancelar cualquier reserva que no uses más</li>
            <li>Consulta el catálogo para ver disponibilidad actualizada</li>
          </ul>
        </div>
      </Card>

      <Toast {...toast} />
    </div>
  );
}
