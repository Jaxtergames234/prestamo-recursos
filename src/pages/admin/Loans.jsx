import React, { useState, useEffect } from 'react';
import { getLoans, getResources, updateLoan, deleteLoan } from '../../data/firebaseService';
import { PageHeader, SearchBar, FilterChips, Card, Btn, Modal, Field, Input, Select, Table, Tr, Td, EmptyState, Toast } from '../../components/UI';
import { useToast } from '../../utils/useToast';

const STATUS_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'overdue', label: 'Con retraso' },
  { value: 'returned', label: 'Devueltos' },
];

const STATUS_STYLE = {
  active: { bg: 'var(--status-loaned-bg)', color: 'var(--status-loaned-text)', label: 'Activo' },
  overdue: { bg: 'var(--status-maintenance-bg)', color: 'var(--status-maintenance-text)', label: 'Con retraso' },
  returned: { bg: 'var(--status-available-bg)', color: 'var(--status-available-text)', label: 'Devuelto' },
};

export default function AdminLoans() {
  const [loans, setLoans] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ resourceId: '', userName: '', dueDate: '', notes: '' });
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load data from Firebase
    Promise.all([getLoans(), getResources()]).then(([l, r]) => {
      setLoans(l || []);
      setResources(r || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const RESOURCES = resources;
  const loanableResources = RESOURCES.filter(r => r.status === 'available' || r.status === 'reserved');

  const filtered = loans.filter(l => {
    const matchSearch = l.resourceName.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleReturn(id) {
    setLoans(prev => prev.map(l => l.id === id ? { ...l, status: 'returned', returnDate: new Date().toISOString().split('T')[0] } : l));
    showToast('Devolución registrada exitosamente');
  }

  function handleCreate() {
    if (!form.resourceId || !form.userName || !form.dueDate) return showToast('Completa todos los campos requeridos', 'error');
    const resource = RESOURCES.find(r => r.id === form.resourceId);
    const today = new Date().toISOString().split('T')[0];
    const newLoan = {
      id: `l${Date.now()}`,
      resourceId: form.resourceId,
      resourceName: resource?.name || '',
      userId: 'u_new',
      userName: form.userName,
      loanDate: today,
      dueDate: form.dueDate,
      returnDate: null,
      status: 'active',
      notes: form.notes,
    };
    setLoans(prev => [newLoan, ...prev]);
    showToast('Préstamo registrado exitosamente');
    setModalOpen(false);
    setForm({ resourceId: '', userName: '', dueDate: '', notes: '' });
  }

  const activeCount = loans.filter(l => l.status === 'active').length;
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  return (
    <div>
      <PageHeader
        title="Gestión de préstamos"
        subtitle={`${activeCount} activos · ${overdueCount} con retraso`}
        action={<Btn variant="primary" onClick={() => setModalOpen(true)}>+ Registrar préstamo</Btn>}
      />

      <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar préstamo..." />
        <FilterChips options={STATUS_OPTS} value={statusFilter} onChange={setStatusFilter} />
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </Card>

      <Card>
        {filtered.length === 0
          ? <EmptyState icon="🔑" title="Sin préstamos" subtitle="No hay préstamos para los filtros seleccionados." />
          : (
            <Table headers={['Recurso', 'Usuario', 'Fecha préstamo', 'Fecha límite', 'Devolución', 'Estado', 'Acciones']}>
              {filtered.map(l => {
                const s = STATUS_STYLE[l.status] || STATUS_STYLE.active;
                return (
                  <Tr key={l.id}>
                    <Td><strong style={{ fontWeight: 500 }}>{l.resourceName}</strong></Td>
                    <Td style={{ color: 'var(--text-secondary)' }}>{l.userName}</Td>
                    <Td><span className="mono">{l.loanDate}</span></Td>
                    <Td>
                      <span className="mono" style={{ color: l.status === 'overdue' ? 'var(--status-maintenance-text)' : 'inherit' }}>
                        {l.dueDate}
                      </span>
                    </Td>
                    <Td><span className="mono" style={{ color: 'var(--text-tertiary)' }}>{l.returnDate || '—'}</span></Td>
                    <Td>
                      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{s.label}</span>
                    </Td>
                    <Td>
                      {(l.status === 'active' || l.status === 'overdue') && (
                        <Btn size="sm" variant="success" onClick={() => handleReturn(l.id)}>Registrar devolución</Btn>
                      )}
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
        title="Registrar préstamo"
        footer={<>
          <Btn onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleCreate}>Registrar préstamo</Btn>
        </>}
      >
        <Field label="Recurso *">
          <Select value={form.resourceId} onChange={e => setForm(f => ({ ...f, resourceId: e.target.value }))}>
            <option value="">Selecciona un recurso...</option>
            {loanableResources.map(r => <option key={r.id} value={r.id}>{r.name} ({r.status === 'available' ? 'Disponible' : 'Reservado'})</option>)}
          </Select>
        </Field>
        <Field label="Usuario solicitante *">
          <Input value={form.userName} onChange={e => setForm(f => ({ ...f, userName: e.target.value }))} placeholder="Nombre del usuario" />
        </Field>
        <Field label="Fecha límite de devolución *">
          <Input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
        </Field>
        <Field label="Observaciones">
          <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notas opcionales..." />
        </Field>
      </Modal>

      <Toast {...toast} />
    </div>
  );
}
