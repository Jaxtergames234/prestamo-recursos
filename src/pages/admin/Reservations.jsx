import React, { useState, useEffect } from 'react';
import { getReservations, getResources, createReservation, confirmReservation, cancelReservation } from '../../data/firebaseService';
import { PageHeader, SearchBar, FilterChips, Card, Btn, Modal, Field, Input, Select, Table, Tr, Td, EmptyState, Badge, Toast } from '../../components/UI';
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

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ resourceId: '', userName: '', date: '', startTime: '08:00', endTime: '10:00', purpose: '' });
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load data from Firebase
    Promise.all([getReservations(), getResources()]).then(([res, rsc]) => {
      setReservations(res || []);
      setResources(rsc || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>⏳ Cargando...</div>;

  const RESOURCES = resources;
  const availableResources = RESOURCES.filter(r => r.status === 'available');

  const filtered = reservations.filter(r => {
    const matchSearch = r.resourceName.toLowerCase().includes(search.toLowerCase()) || r.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  async function handleCreate() {
    if (!form.resourceId || !form.userName || !form.date) {
      return showToast('Completa todos los campos requeridos', 'error');
    }
    
    setSubmitting(true);
    try {
      const resource = RESOURCES.find(r => r.id === form.resourceId);
      const reservationData = {
        resourceId: form.resourceId,
        resourceName: resource?.name || '',
        userId: 'admin_created',
        userName: form.userName,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        status: 'confirmed',
      };
      
      await createReservation(reservationData);
      
      // Reload reservations
      const updatedRes = await getReservations();
      setReservations(updatedRes || []);
      showToast('✓ Reserva creada exitosamente', 'success');
      setModalOpen(false);
      setForm({ resourceId: '', userName: '', date: '', startTime: '08:00', endTime: '10:00', purpose: '' });
    } catch (error) {
      console.error('Error creating reservation:', error);
      showToast('Error al crear la reserva', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(id) {
    try {
      await cancelReservation(id, 'Cancelada por administrador');
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
      showToast('✓ Reserva cancelada', 'info');
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      showToast('Error al cancelar la reserva', 'error');
    }
  }

  async function handleConfirm(id) {
    try {
      await confirmReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
      showToast('✓ Reserva confirmada', 'success');
    } catch (error) {
      console.error('Error confirming reservation:', error);
      showToast('Error al confirmar la reserva', 'error');
    }
  }

  const activeCount = reservations.filter(r => r.status !== 'cancelled').length;
  const pendingCount = reservations.filter(r => r.status === 'pending').length;

  return (
    <div>
      <PageHeader
        title="Gestión de reservas"
        subtitle={`${activeCount} activas · ${pendingCount} por aprobar`}
        action={<Btn variant="primary" onClick={() => setModalOpen(true)}>+ Nueva reserva</Btn>}
      />

      {/* Stats strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'Confirmadas', value: reservations.filter(r => r.status === 'confirmed').length, bg: 'var(--status-available-bg)', color: 'var(--status-available-text)' },
          { label: 'Pendientes', value: pendingCount, bg: 'var(--status-reserved-bg)', color: 'var(--status-reserved-text)' },
          { label: 'Total', value: reservations.length, bg: 'var(--brand-light)', color: 'var(--brand-primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '12px', color: s.color, opacity: 0.8, marginTop: '2px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar por recurso o solicitante..." />
        <FilterChips options={STATUS_OPTS} value={statusFilter} onChange={setStatusFilter} />
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </Card>

      <Card>
        {filtered.length === 0
          ? <EmptyState icon="📅" title="Sin reservas" subtitle="No hay reservas para los filtros seleccionados." />
          : (
            <Table headers={['Recurso', 'Solicitante', 'Fecha', 'Horario', 'Propósito', 'Estado', 'Acciones']}>
              {filtered.map(r => {
                const s = STATUS_STYLE[r.status] || STATUS_STYLE.pending;
                return (
                  <Tr key={r.id}>
                    <Td><strong style={{ fontWeight: 500 }}>{r.resourceName}</strong></Td>
                    <Td style={{ color: 'var(--text-secondary)' }}>{r.userName}</Td>
                    <Td><span className="mono">{r.date}</span></Td>
                    <Td><span className="mono">{r.startTime}–{r.endTime}</span></Td>
                    <Td style={{ color: 'var(--text-secondary)', maxWidth: '160px' }}>{r.purpose}</Td>
                    <Td>
                      <span style={{ background: s.bg, color: s.color, padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{s.label}</span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {r.status === 'pending' && (
                          <Btn size="sm" variant="success" onClick={() => handleConfirm(r.id)}>✓ Confirmar</Btn>
                        )}
                        {r.status !== 'cancelled' && (
                          <Btn size="sm" variant="danger" onClick={() => handleCancel(r.id)}>✕ Cancelar</Btn>
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Nueva reserva"
        footer={
          <>
            <Btn onClick={() => setModalOpen(false)} disabled={submitting}>Cancelar</Btn>
            <Btn variant="primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? '⏳ Creando...' : '✓ Crear reserva'}
            </Btn>
          </>
        }
      >
        <Field label="Recurso *">
          <Select value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))} disabled={submitting}>
            <option value="">Selecciona un recurso...</option>
            {availableResources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </Field>
        <Field label="Solicitante *">
          <Input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} placeholder="Nombre del solicitante" disabled={submitting} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Fecha *">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} disabled={submitting} />
          </Field>
          <Field label="Propósito">
            <Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Clase, reunión..." disabled={submitting} />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Hora inicio">
            <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} disabled={submitting} />
          </Field>
          <Field label="Hora fin">
            <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} disabled={submitting} />
          </Field>
        </div>
      </Modal>

      <Toast {...toast} />
    </div>
  );
}
