import React, { useState, useEffect } from 'react';
import { getLoans, getCurrentUser } from '../../data/firebaseService';
import { PageHeader, Card, Table, Tr, Td, EmptyState } from '../../components/UI';

const STATUS_STYLE = {
  active: { bg: 'var(--status-loaned-bg)', color: 'var(--status-loaned-text)', label: 'Activo' },
  overdue: { bg: 'var(--status-maintenance-bg)', color: 'var(--status-maintenance-text)', label: '⚠ Con retraso' },
  returned: { bg: 'var(--status-available-bg)', color: 'var(--status-available-text)', label: 'Devuelto' },
};

export default function UserLoans() {
  const [loans, setLoans] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from Firebase
    Promise.all([getLoans(), getCurrentUser()]).then(([l, u]) => {
      setLoans(l || []);
      setCurrentUser(u || {});
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const LOANS = loans;
  const CURRENT_USER = currentUser;
  const myLoans = LOANS.filter(l => l.userId === CURRENT_USER.id);
  const activeLoans = myLoans.filter(l => l.status === 'active' || l.status === 'overdue');
  const returnedLoans = myLoans.filter(l => l.status === 'returned');

  return (
    <div>
      <PageHeader title="Mis préstamos" subtitle={`${activeLoans.length} activos · ${returnedLoans.length} devueltos`} />

      {/* Active loans highlighted */}
      {activeLoans.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Activos</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeLoans.map(l => {
              const s = STATUS_STYLE[l.status];
              return (
                <Card key={l.id} style={{
                  padding: '16px',
                  borderLeft: `3px solid ${l.status === 'overdue' ? 'var(--error)' : 'var(--brand-primary)'}`,
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
                    background: l.status === 'overdue' ? 'var(--status-maintenance-bg)' : 'var(--status-loaned-bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0,
                  }}>🔑</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{l.resourceName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      Prestado el {l.loanDate} · Vence el {l.dueDate}
                    </div>
                    {l.notes && <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{l.notes}</div>}
                  </div>
                  <span style={{ background: s.bg, color: s.color, padding: '3px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>
                    {s.label}
                  </span>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Historial</div>
      <Card>
        {myLoans.length === 0
          ? <EmptyState icon="🔑" title="Sin préstamos" subtitle="Aún no tienes préstamos registrados." />
          : (
            <Table headers={['Recurso', 'Prestado', 'Vencía', 'Devuelto', 'Estado']}>
              {myLoans.map(l => {
                const s = STATUS_STYLE[l.status];
                return (
                  <Tr key={l.id}>
                    <Td><strong style={{ fontWeight: 500 }}>{l.resourceName}</strong></Td>
                    <Td><span className="mono">{l.loanDate}</span></Td>
                    <Td><span className="mono">{l.dueDate}</span></Td>
                    <Td><span className="mono" style={{ color: l.returnDate ? 'inherit' : 'var(--text-tertiary)' }}>{l.returnDate || '—'}</span></Td>
                    <Td>
                      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500 }}>{s.label}</span>
                    </Td>
                  </Tr>
                );
              })}
            </Table>
          )}
      </Card>
    </div>
  );
}
