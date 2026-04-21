import React, { useState, useEffect } from 'react';
import { MetricCard, Card, StatusBadge, Badge, Table, Tr, Td } from '../../components/UI';
import { getStats, getLoans, getReservations } from '../../data/firebaseService';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    // Load data from Firebase
    Promise.all([getStats(), getLoans(), getReservations()]).then(([s, l, r]) => {
      setStats(s || {});
      setLoans(l || []);
      setReservations(r || []);
    });
  }, []);

  if (!stats) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const STATS = stats;
  const activeLoans = loans.filter(l => l.status === 'active' || l.status === 'overdue');
  const pendingReservations = reservations.filter(r => r.status === 'pending');

  return (
    <div>
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <MetricCard label="Total recursos" value={STATS.totalResources} change="8 tipos diferentes" />
        <MetricCard label="Disponibles" value={STATS.available} change="↑ respecto a ayer" changeType="up" />
        <MetricCard label="En préstamo" value={STATS.loaned} change={`1 con retraso`} changeType="dn" />
        <MetricCard label="Mantenimiento" value={STATS.maintenance} change="Lab. Física B" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <MetricCard label="Préstamos este mes" value={STATS.totalLoansMonth} change="↑ 12% vs marzo" changeType="up" />
        <MetricCard label="Tasa de puntualidad" value={`${STATS.punctualityRate}%`} change="↑ 3 puntos" changeType="up" />
        <MetricCard label="Retrasos reportados" value={STATS.delaysMonth} change="↑ 2 vs mes pasado" changeType="dn" />
        <MetricCard label="Incidencias de daño" value={STATS.incidentsMonth} change="Todos resueltos" />
      </div>

      {/* Quick status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {/* Active loans */}
        <Card>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Préstamos activos</span>
            <Badge label={activeLoans.length} bg="var(--status-loaned-bg)" color="var(--status-loaned-text)" />
          </div>
          <Table headers={['Recurso', 'Usuario', 'Vence', 'Estado']}>
            {activeLoans.map(l => (
              <Tr key={l.id}>
                <Td><strong style={{ fontWeight: 500 }}>{l.resourceName}</strong></Td>
                <Td style={{ color: 'var(--text-secondary)' }}>{l.userName}</Td>
                <Td><span className="mono">{l.dueDate}</span></Td>
                <Td>
                  <span style={{
                    background: l.status === 'overdue' ? 'var(--status-maintenance-bg)' : 'var(--status-loaned-bg)',
                    color: l.status === 'overdue' ? 'var(--status-maintenance-text)' : 'var(--status-loaned-text)',
                    padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                  }}>{l.status === 'overdue' ? 'Con retraso' : 'Activo'}</span>
                </Td>
              </Tr>
            ))}
          </Table>
        </Card>

        {/* Pending reservations */}
        <Card>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Reservas pendientes de aprobación</span>
            <Badge label={pendingReservations.length} bg="var(--status-reserved-bg)" color="var(--status-reserved-text)" />
          </div>
          <Table headers={['Recurso', 'Solicitante', 'Fecha', 'Horario']}>
            {pendingReservations.length === 0
              ? <Tr><Td style={{ color: 'var(--text-tertiary)' }} colSpan="4">Sin pendientes</Td></Tr>
              : pendingReservations.map(r => (
                <Tr key={r.id}>
                  <Td><strong style={{ fontWeight: 500 }}>{r.resourceName}</strong></Td>
                  <Td style={{ color: 'var(--text-secondary)' }}>{r.userName}</Td>
                  <Td><span className="mono">{r.date}</span></Td>
                  <Td><span className="mono">{r.startTime}–{r.endTime}</span></Td>
                </Tr>
              ))}
          </Table>
        </Card>
      </div>

      {/* Usage bar chart */}
      <Card style={{ padding: '20px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Uso por tipo de recurso — Abril 2026</div>
        {[
          { label: 'Salones', pct: 82, color: '#378ADD' },
          { label: 'Laboratorios', pct: 74, color: '#1D9E75' },
          { label: 'Proyectores', pct: 91, color: '#7F77DD' },
          { label: 'Laptops', pct: 68, color: '#185FA5' },
          { label: 'Cámaras', pct: 55, color: '#D4537E' },
          { label: 'Audio', pct: 43, color: '#85B7EB' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <span style={{ width: '90px', fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>{item.label}</span>
            <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: '99px', height: '7px', overflow: 'hidden' }}>
              <div style={{ width: `${item.pct}%`, background: item.color, height: '100%', borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
            <span style={{ width: '36px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>{item.pct}%</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
