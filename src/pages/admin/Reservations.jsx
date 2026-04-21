import React, { useState, useEffect } from 'react';
import { getReservations, getResources, updateReservation, deleteReservation } from '../../data/firebaseService';
import { PageHeader, SearchBar, FilterChips, Card, Btn, Modal, Field, Input, Select, Table, Tr, Td, EmptyState, Badge, Toast } from '../../components/UI';
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

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const RESOURCES = resources;
  const availableResources = RESOURCES.filter(r => r.status === 'available');

  const filtered = reservations.filter(r => {
    const matchSearch = r.resourceName.toLowerCase().includes(search.toLowerCase()) || r.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleCreate() {
    if (!form.resourceId || !form.userName || !form.date) return showToast('Completa todos los campos requeridos', 'error');
    const resource = RESOURCES.find(r => r.id === form.resourceId);
    const newRes = {
      id: `res${Date.now()}`,
      resourceId: form.resourceId,
      resourceName: resource?.name || '',
      userId: 'u_new',
      userName: form.userName,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      purpose: form.purpose,
      status: 'confirmed',
    };
    setReservations(prev => [newRes, ...prev]);
    showToast('Reserva creada exitosamente');
    setModalOpen(false);
    setForm({ resourceId: '', userName: '', date: '', startTime: '08:00', endTime: '10:00', purpose: '' });
  }

  function handleCancel(id) {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
    showToast('Reserva cancelada', 'info');
  }

  function handleConfirm(id) {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'confirmed' } : r));
    showToast('Reserva confirmada');
  }

  return (
    <div>
      <PageHeader
        title="Gestión de reservas"
        subtitle={`${reservations.filter(r => r.status !== 'cancelled').length} reservas activas`}
        action={<Btn variant="primary" onClick={() => setModalOpen(true)}>+ Nueva reserva</Btn>}
      />

      <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar reserva..." />
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
                      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{s.label}</span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {r.status === 'pending' && <Btn size="sm" variant="success" onClick={() => handleConfirm(r.id)}>Confirmar</Btn>}
                        {r.status !== 'cancelled' && <Btn size="sm" variant="danger" onClick={() => handleCancel(r.id)}>Cancelar</Btn>}
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
        footer={<>
          <Btn onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleCreate}>Confirmar reserva</Btn>
        </>}
      >
        <Field label="Recurso *">
          <Select value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}>
            <option value="">Selecciona un recurso...</option>
            {availableResources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </Select>
        </Field>
        <Field label="Solicitante *">
          <Input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} placeholder="Nombre del solicitante" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Fecha *">
            <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </Field>
          <Field label="Propósito">
            <Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Clase, reunión..." />
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Hora inicio">
            <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </Field>
          <Field label="Hora fin">
            <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </Field>
        </div>
      </Modal>

      <Toast {...toast} />
    </div>
  );
}
