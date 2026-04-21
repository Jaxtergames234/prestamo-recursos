import React, { useState, useEffect } from 'react';
import { getResources } from '../../data/firebaseService';
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
  const [form, setForm] = useState({ date: '', startTime: '08:00', endTime: '10:00', purpose: '' });
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load resources from Firebase
    getResources().then(r => {
      setResources(r || []);
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

  function handleSubmit() {
    if (!form.date || !form.purpose) return showToast('Completa fecha y propósito', 'error');
    showToast(`Reserva de "${selectedResource.name}" enviada para aprobación`);
    setModalOpen(false);
  }

  return (
    <div>
      <PageHeader title="Catálogo de recursos" subtitle="Consulta disponibilidad y realiza reservas" />

      <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar recurso..." />
        <FilterChips options={TYPE_OPTS} value={typeFilter} onChange={setTypeFilter} />
        <button
          onClick={() => setOnlyAvailable(!onlyAvailable)}
          style={{
            padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
            border: '1px solid', cursor: 'pointer', transition: 'all 0.15s',
            background: onlyAvailable ? '#1D9E75' : 'var(--bg-primary)',
            color: onlyAvailable ? '#fff' : 'var(--text-secondary)',
            borderColor: onlyAvailable ? '#1D9E75' : 'var(--border-primary)',
          }}
        >✓ Solo disponibles</button>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>{filtered.length} recurso{filtered.length !== 1 ? 's' : ''}</span>
      </Card>

      {filtered.length === 0
        ? <Card><EmptyState icon="🔍" title="Sin resultados" subtitle="Ajusta los filtros para ver más recursos." /></Card>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {filtered.map(r => (
              <Card key={r.id} style={{ padding: '16px', transition: 'box-shadow 0.15s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--brand-light)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '18px',
                  }}>{TYPE_ICONS[r.type]}</div>
                  <StatusBadge status={r.status} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '3px' }}>{r.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{TYPE_LABELS[r.type]} · {r.location}</div>
                {r.capacity && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>👥 Capacidad: {r.capacity} personas</div>}
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '14px', lineHeight: 1.4 }}>{r.description}</div>
                <Btn
                  variant={r.status === 'available' ? 'primary' : 'default'}
                  disabled={r.status !== 'available'}
                  onClick={() => handleReserve(r)}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {r.status === 'available' ? 'Reservar' : 'No disponible'}
                </Btn>
              </Card>
            ))}
          </div>
        )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Reservar: ${selectedResource?.name}`}
        footer={<>
          <Btn onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleSubmit}>Enviar solicitud</Btn>
        </>}
      >
        {selectedResource && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '12px', marginBottom: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{selectedResource.name}</strong> · {selectedResource.location}
            {selectedResource.capacity && ` · Capacidad: ${selectedResource.capacity} pers.`}
          </div>
        )}
        <Field label="Fecha *">
          <Input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Hora inicio">
            <Input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
          </Field>
          <Field label="Hora fin">
            <Input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
          </Field>
        </div>
        <Field label="Propósito *">
          <Input value={form.purpose} onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))} placeholder="Clase, reunión, práctica..." />
        </Field>
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px', padding: '10px 12px', background: 'var(--brand-light)', borderRadius: 'var(--radius-sm)' }}>
          ℹ Tu solicitud será revisada por el administrador antes de ser confirmada.
        </div>
      </Modal>

      <Toast {...toast} />
    </div>
  );
}
