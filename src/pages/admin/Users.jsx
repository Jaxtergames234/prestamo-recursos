import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../data/firebaseService';
import { PageHeader, SearchBar, FilterChips, Card, Btn, Modal, Field, Input, Select, Table, Tr, Td, EmptyState, Avatar, Badge, Toast } from '../../components/UI';
import { useToast } from '../../utils/useToast';

const ROLE_OPTS = [
  { value: 'all', label: 'Todos' },
  { value: 'student', label: 'Estudiantes' },
  { value: 'teacher', label: 'Docentes' },
  { value: 'admin', label: 'Administradores' },
];

const ROLE_LABELS = { student: 'Estudiante', teacher: 'Docente', admin: 'Administrador' };
const ROLE_COLORS = {
  student: { bg: 'var(--brand-light)', color: 'var(--brand-primary)' },
  teacher: { bg: '#EDE9FE', color: '#5B21B6' },
  admin: { bg: '#FEF3C7', color: '#92400E' },
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', role: 'student', department: '' });
  const { toast, showToast } = useToast();

  useEffect(() => {
    // Load users from Firebase
    getUsers().then(u => {
      setUsers(u || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function openNew() {
    setEditTarget(null);
    setForm({ name: '', email: '', role: 'student', department: '' });
    setModalOpen(true);
  }

  function openEdit(u) {
    setEditTarget(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department });
    setModalOpen(true);
  }

  function handleSave() {
    if (!form.name || !form.email) return showToast('Completa nombre y correo', 'error');
    const initials = form.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    if (editTarget) {
      setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...form, avatar: initials } : u));
      showToast('Usuario actualizado');
    } else {
      setUsers(prev => [...prev, { id: `u${Date.now()}`, ...form, avatar: initials, active: true }]);
      showToast('Usuario creado exitosamente');
    }
    setModalOpen(false);
  }

  function handleToggle(id) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
    showToast('Estado del usuario actualizado', 'info');
  }

  return (
    <div>
      <PageHeader
        title="Gestión de usuarios"
        subtitle={`${users.filter(u => u.active).length} usuarios activos`}
        action={<Btn variant="primary" onClick={openNew}>+ Nuevo usuario</Btn>}
      />

      <Card style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="Buscar usuario..." />
        <FilterChips options={ROLE_OPTS} value={roleFilter} onChange={setRoleFilter} />
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-tertiary)' }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
      </Card>

      <Card>
        {filtered.length === 0
          ? <EmptyState icon="👤" title="Sin usuarios" subtitle="No hay usuarios para los filtros seleccionados." />
          : (
            <Table headers={['Usuario', 'Correo', 'Rol', 'Departamento', 'Estado', 'Acciones']}>
              {filtered.map(u => {
                const rc = ROLE_COLORS[u.role] || ROLE_COLORS.student;
                return (
                  <Tr key={u.id}>
                    <Td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar initials={u.avatar} />
                        <strong style={{ fontWeight: 500 }}>{u.name}</strong>
                      </div>
                    </Td>
                    <Td style={{ color: 'var(--text-secondary)' }}>{u.email}</Td>
                    <Td>
                      <span style={{ background: rc.bg, color: rc.color, padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </Td>
                    <Td style={{ color: 'var(--text-secondary)' }}>{u.department}</Td>
                    <Td>
                      <span style={{
                        background: u.active ? 'var(--status-available-bg)' : '#F3F4F6',
                        color: u.active ? 'var(--status-available-text)' : '#6B7280',
                        padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                      }}>{u.active ? 'Activo' : 'Inactivo'}</span>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Btn size="sm" onClick={() => openEdit(u)}>Editar</Btn>
                        <Btn size="sm" variant={u.active ? 'danger' : 'success'} onClick={() => handleToggle(u.id)}>
                          {u.active ? 'Desactivar' : 'Activar'}
                        </Btn>
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
        title={editTarget ? 'Editar usuario' : 'Nuevo usuario'}
        footer={<>
          <Btn onClick={() => setModalOpen(false)}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleSave}>{editTarget ? 'Guardar cambios' : 'Crear usuario'}</Btn>
        </>}
      >
        <Field label="Nombre completo *">
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nombre del usuario" />
        </Field>
        <Field label="Correo electrónico *">
          <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="usuario@institucion.edu" />
        </Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Field label="Rol">
            <Select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="student">Estudiante</option>
              <option value="teacher">Docente</option>
              <option value="admin">Administrador</option>
            </Select>
          </Field>
          <Field label="Departamento">
            <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Ej: Ingeniería" />
          </Field>
        </div>
      </Modal>

      <Toast {...toast} />
    </div>
  );
}
