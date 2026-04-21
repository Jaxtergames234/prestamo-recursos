import React, { useState, useEffect } from 'react';
import { Card, MetricCard, Table, Tr, Td, Btn, PageHeader } from '../../components/UI';
import { getStats } from '../../data/firebaseService';

const BAR_DATA = [
  { label: 'Salones', pct: 82, color: '#378ADD' },
  { label: 'Laboratorios', pct: 74, color: '#1D9E75' },
  { label: 'Proyectores', pct: 91, color: '#7F77DD' },
  { label: 'Laptops', pct: 68, color: '#185FA5' },
  { label: 'Cámaras', pct: 55, color: '#D4537E' },
  { label: 'Audio', pct: 43, color: '#85B7EB' },
];

const DELAY_DATA = [
  { name: 'Proyector BenQ 3', delays: 7, avg: '+47 min', color: 'var(--status-maintenance-text)' },
  { name: 'Lab. Química A', delays: 5, avg: '+32 min', color: 'var(--status-maintenance-text)' },
  { name: 'Salón 204', delays: 4, avg: '+25 min', color: '#993C1D' },
  { name: 'Laptop Dell 12', delays: 2, avg: '+15 min', color: 'var(--text-secondary)' },
  { name: 'Cámara Sony 2', delays: 1, avg: '+10 min', color: 'var(--text-secondary)' },
];

const TOP_USERS = [
  { name: 'Prof. García', dept: 'Ingeniería', loans: 18, punctuality: '98%', incidents: 0, profile: 'Confiable', good: true },
  { name: 'Dpto. Sistemas', dept: 'Tecnología', loans: 14, punctuality: '95%', incidents: 0, profile: 'Confiable', good: true },
  { name: 'M. Torres', dept: 'Ingeniería', loans: 11, punctuality: '72%', incidents: 1, profile: 'Observado', good: false },
  { name: 'Prof. López', dept: 'Ciencias', loans: 9, punctuality: '78%', incidents: 0, profile: 'Observado', good: false },
  { name: 'C. Ramírez', dept: 'Admisiones', loans: 7, punctuality: '100%', incidents: 0, profile: 'Confiable', good: true },
];

export default function AdminReports() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Load stats from Firebase
    getStats().then(s => setStats(s || {}));
  }, []);

  if (!stats) return <div style={{ padding: '20px' }}>Cargando...</div>;

  const STATS = stats;
  return (
    <div>
      <PageHeader
        title="Reportes de uso"
        subtitle="Abril 2026"
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Btn>Exportar CSV</Btn>
            <Btn variant="primary">Exportar PDF</Btn>
          </div>
        }
      />

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        <MetricCard label="Préstamos totales" value={STATS.totalLoansMonth} change="↑ 12% vs marzo" changeType="up" />
        <MetricCard label="Tasa de puntualidad" value={`${STATS.punctualityRate}%`} change="↑ 3 puntos" changeType="up" />
        <MetricCard label="Retrasos reportados" value={STATS.delaysMonth} change="↑ 2 vs mes pasado" changeType="dn" />
        <MetricCard label="Incidencias de daño" value={STATS.incidentsMonth} change="Todos resueltos" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
        {/* Usage bars */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Uso por tipo de recurso</div>
          {BAR_DATA.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <span style={{ width: '90px', fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>{item.label}</span>
              <div style={{ flex: 1, background: 'var(--bg-tertiary)', borderRadius: '99px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${item.pct}%`, background: item.color, height: '100%', borderRadius: '99px' }} />
              </div>
              <span style={{ width: '36px', fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', textAlign: 'right' }}>{item.pct}%</span>
            </div>
          ))}
        </Card>

        {/* Delay table */}
        <Card style={{ padding: '20px' }}>
          <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px' }}>Recursos con más retrasos</div>
          <Table headers={['Recurso', 'Retrasos', 'Tiempo prom.']}>
            {DELAY_DATA.map((d, i) => (
              <Tr key={i}>
                <Td>{d.name}</Td>
                <Td><span style={{ color: d.color, fontWeight: 500 }}>{d.delays}</span></Td>
                <Td><span className="mono">{d.avg}</span></Td>
              </Tr>
            ))}
          </Table>
        </Card>
      </div>

      {/* Top users */}
      <Card>
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-secondary)', fontWeight: 600, fontSize: '14px' }}>
          Usuarios con más préstamos — Abril 2026
        </div>
        <Table headers={['Usuario', 'Departamento', 'Préstamos', 'Puntualidad', 'Incidencias', 'Perfil']}>
          {TOP_USERS.map((u, i) => (
            <Tr key={i}>
              <Td><strong style={{ fontWeight: 500 }}>{u.name}</strong></Td>
              <Td style={{ color: 'var(--text-secondary)' }}>{u.dept}</Td>
              <Td>{u.loans}</Td>
              <Td>
                <span style={{
                  background: u.good ? 'var(--status-available-bg)' : 'var(--status-reserved-bg)',
                  color: u.good ? 'var(--status-available-text)' : 'var(--status-reserved-text)',
                  padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                }}>{u.punctuality}</span>
              </Td>
              <Td style={{ color: u.incidents > 0 ? 'var(--status-maintenance-text)' : 'var(--text-secondary)' }}>{u.incidents}</Td>
              <Td>
                <span style={{
                  background: u.good ? 'var(--status-available-bg)' : 'var(--status-reserved-bg)',
                  color: u.good ? 'var(--status-available-text)' : 'var(--status-reserved-text)',
                  padding: '2px 10px', borderRadius: '99px', fontSize: '12px', fontWeight: 500,
                }}>{u.profile}</span>
              </Td>
            </Tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
