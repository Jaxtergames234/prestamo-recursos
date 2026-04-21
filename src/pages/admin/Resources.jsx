import React, { useState, useEffect } from 'react';
import { getResources, createResource, updateResource, deleteResource } from '../../data/firebaseService';
import { TYPE_LABELS, STATUS_LABELS } from '../../data/mockData';
import { PageHeader, SearchBar, FilterChips, Card, StatusBadge, Btn, Modal, Field, Input, Select, Textarea, Table, Tr, Td, EmptyState } from '../../components/UI';
import { useToast } from '../../utils/useToast';
import { Toast } from '../../components/UI';

const TYPE_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'salon', label: 'Salones' },
  { value: 'lab', label: 'Laboratorios' },
  { value: 'equipment', label: 'Equipos' },
];

const STATUS_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponible' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'loaned', label: 'Prestado' },
  { value: 'maintenance', label: 'Mantenimiento' },
];

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    name: '',
    type: 'salon',
    location: '',
    capacity: '',
    description: '',
    status: 'available'
  });

  const { toast, showToast } = useToast();

  // 🔥 LOAD DATA CON DEBUG
  useEffect(() => {
    async function loadData() {
      try {
        console.log("🚀 Cargando recursos desde Firebase...");

        const r = await getResources();

        console.log("📦 Recursos recibidos:", r);

        setResources(r || []);
      } catch (error) {
        console.error("❌ Error cargando recursos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  console.log("🎯 Render resources:", resources);

  // 🔥 FILTRO SEGURO
  const filtered = (resources || []).filter(r => {
    const matchSearch =
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.location || "").toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'all' || r.type === typeFilter;
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;

    return matchSearch && matchType && matchStatus;
  });

  function openNew() {
    setEditTarget(null);
    setForm({
      name: '',
      type: 'salon',
      location: '',
      capacity: '',
      description: '',
      status: 'available'
    });
    setModalOpen(true);
  }

  function openEdit(r) {
    setEditTarget(r);
    setForm({
      name: r.name || '',
      type: r.type || 'salon',
      location: r.location || '',
      capacity: r.capacity || '',
      description: r.description || '',
      status: r.status || 'available'
    });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.location) {
      return showToast('Completa los campos requeridos', 'error');
    }

    if (editTarget) {
      updateResource(editTarget.id, {
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null
      })
        .then(() => {
          setResources(prev =>
            prev.map(r =>
              r.id === editTarget.id
                ? { ...r, ...form, capacity: form.capacity ? Number(form.capacity) : null }
                : r
            )
          );
          showToast('Recurso actualizado');
          setModalOpen(false);
        })
        .catch(() => showToast('Error actualizando recurso', 'error'));
    } else {
      const newR = {
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null
      };

      createResource(newR)
        .then(id => {
          setResources(prev => [...prev, { id, ...newR }]);
          showToast('Recurso creado exitosamente');
          setModalOpen(false);
        })
        .catch(() => showToast('Error creando recurso', 'error'));
    }
  }

  function handleDelete(id) {
    deleteResource(id)
      .then(() => {
        setResources(prev => prev.filter(r => r.id !== id));
        showToast('Recurso eliminado', 'info');
      })
      .catch(() => showToast('Error eliminando recurso', 'error'));
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando...</div>;
  }

  return (
    <div>
      <PageHeader
        title="Recursos institucionales"
        subtitle={`${resources.length} recursos registrados`}
        action={<Btn variant="primary" onClick={openNew}>+ Nuevo recurso</Btn>}
      />

      <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar recurso..." />
        <FilterChips options={TYPE_OPTS} value={typeFilter} onChange={setTypeFilter} />
        <FilterChips options={STATUS_OPTS} value={statusFilter} onChange={setStatusFilter} />
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
        </span>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="📦" title="Sin resultados" subtitle="Ajusta los filtros o crea un nuevo recurso." />
        ) : (
          <Table headers={['Recurso', 'Tipo', 'Ubicación', 'Capacidad', 'Estado', 'Acciones']}>
            {filtered.map(r => (
              <Tr key={r.id}>
                <Td>
                  <div style={{ fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {r.description}
                  </div>
                </Td>
                <Td>{TYPE_LABELS[r.type]}</Td>
                <Td>{r.location}</Td>
                <Td>{r.capacity ? `${r.capacity} pers.` : '—'}</Td>
                <Td><StatusBadge status={r.status} /></Td>
                <Td>
                  <Btn size="sm" onClick={() => openEdit(r)}>Editar</Btn>
                  <Btn size="sm" variant="danger" onClick={() => handleDelete(r.id)}>Eliminar</Btn>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTarget ? 'Editar recurso' : 'Nuevo recurso'}
        footer={
          <>
            <Btn onClick={() => setModalOpen(false)}>Cancelar</Btn>
            <Btn variant="primary" onClick={handleSave}>
              {editTarget ? 'Guardar cambios' : 'Crear recurso'}
            </Btn>
          </>
        }
      >
        <Field label="Nombre *">
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </Field>

        <Field label="Ubicación *">
          <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
        </Field>
      </Modal>

      <Toast {...toast} />
    </div>
  );
}