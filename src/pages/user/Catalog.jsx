import React, { useState, useEffect } from 'react';
import { getResources, getCurrentUser, createReservation } from '../../data/firebaseService';
import { TYPE_LABELS } from '../../data/mockData';
import { PageHeader, SearchBar, FilterChips, Card, StatusBadge, Btn, Modal, Field, Input, Select, EmptyState, Toast } from '../../components/UI';
import { useToast } from '../../utils/useToast';

const TYPE_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'salon', label: 'Salones' },
  { value: 'lab', label: 'Laboratorios' },
  { value: 'equipment', label: 'Equipos' },
];

const TYPE_ICONS = { salon: '🏫', lab: '🔬', equipment: '💻' };

export default function UserCatalog() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: '', startTime: '08:00', endTime: '10:00', purpose: '' });
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load resources and current user from Firebase
    Promise.all([getResources(), getCurrentUser()]).then(([r, u]) => {
      setResources(r || []);
      setCurrentUser(u || {});
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const RESOURCES = resources;

  const filtered = RESOURCES.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.location.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchAvail = !onlyAvailable || r.status === 'available';
    return matchSearch && matchType && matchAvail;
  });

  function handleReserve(resource) {
    setSelectedResource(resource);
    setForm({ date: '', startTime: '08:00', endTime: '10:00', purpose: '' });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.date || !form.purpose) {
      return showToast('Completa fecha y propósito', 'error');
    }
    
    if (!currentUser?.id) {
      return showToast('No hay usuario autenticado', 'error');
    }

    setSubmitting(true);
    try {
      const reservationData = {
        resourceId: selectedResource.id,
        resourceName: selectedResource.name,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email,
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
        status: 'pending'
      };

      await createReservation(reservationData);
      showToast(`Reserva de "${selectedResource.name}" enviada para aprobación`, 'success');
      setModalOpen(false);
      setForm({ date: '', startTime: '08:00', endTime: '10:00', purpose: '' });
    } catch (error) {
      console.error('Error creating reservation:', error);
      showToast('Error al crear la reserva', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Catálogo de recursos" subtitle="Consulta disponibilidad y realiza reservas" />

      <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar recurso..." />
        <FilterChips options={TYPE_OPTS} value={typeFilter} onChange={setTypeFilter} />
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
          <input type="checkbox" checked={onlyAvailable} onChange={e => setOnlyAvailable(e.target.checked)} />
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Solo disponibles</span>
        </label>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <Card>
              <EmptyState icon="📚" title="Sin recursos" subtitle="No hay recursos disponibles con los filtros seleccionados." />
            </Card>
          </div>
        ) : (
          filtered.map(resource => (
            <Card key={resource.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                    {TYPE_ICONS[resource.type]} <strong>{resource.name}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>📍 {resource.location}</div>
                </div>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '99px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: resource.status === 'available' ? 'var(--status-available-bg)' : 'var(--status-reserved-bg)',
                  color: resource.status === 'available' ? 'var(--status-available-text)' : 'var(--status-reserved-text)'
                }}>
                  {resource.status === 'available' ? '✓ Disponible' : '⏱ Reservado'}
                </span>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {resource.description}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', marginBottom: '2px' }}>Tipo</div>
                  <div style={{ fontWeight: 600 }}>{TYPE_LABELS[resource.type] || resource.type}</div>
                </div>
                <div style={{ padding: '8px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ color: 'var(--text-tertiary)', marginBottom: '2px' }}>Capacidad</div>
                  <div style={{ fontWeight: 600 }}>{resource.capacity || 'N/A'}</div>
                </div>
              </div>

              <Btn
                variant={resource.status === 'available' ? 'primary' : 'secondary'}
                onClick={() => handleReserve(resource)}
                disabled={!currentUser}
              >
                📅 Hacer reserva
              </Btn>
            </Card>
          ))
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Reservar: ${selectedResource?.name}`}
        footer={
          <>
            <Btn onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn variant="primary" onClick={handleSubmit} disabled={submitting}>
              {submitting ? '⏳ Creando...' : '✓ Enviar reserva'}
            </Btn>
          </>
        }
      >
        {selectedResource && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-secondary)' }}>
              📍 <strong>{selectedResource.location}</strong> • Capacidad: {selectedResource.capacity || 'N/A'}
            </div>

            <Field label="Fecha de reserva *">
              <Input 
                type="date" 
                value={form.date} 
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                disabled={submitting}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Hora inicio">
                <Input 
                  type="time" 
                  value={form.startTime} 
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  disabled={submitting}
                />
              </Field>
              <Field label="Hora fin">
                <Input 
                  type="time" 
                  value={form.endTime} 
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  disabled={submitting}
                />
              </Field>
            </div>

            <Field label="Propósito de la reserva *">
              <Input
                value={form.purpose}
                onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                placeholder="Ej: Clase de Python, Reunión del proyecto..."
                disabled={submitting}
              />
            </Field>

            <div style={{ padding: '12px', background: 'var(--brand-light)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--brand-primary)' }}>
              ℹ️ Tu reserva será enviada para aprobación del administrador.
            </div>
          </div>
        )}
      </Modal>

      <Toast {...toast} />
    </div>
  );
}
