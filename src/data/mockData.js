// ─── CONFIGURATION CONSTANTS ───────────────────────────────────────────────────
// UI Labels and styling constants (no data)
// Data is now managed via Firebase

export const STATUS_LABELS = {
  available: 'Disponible',
  reserved: 'Reservado',
  loaned: 'Prestado',
  maintenance: 'Mantenimiento',
};

export const STATUS_COLORS = {
  available: { bg: 'var(--status-available-bg)', text: 'var(--status-available-text)' },
  reserved: { bg: 'var(--status-reserved-bg)', text: 'var(--status-reserved-text)' },
  loaned: { bg: 'var(--status-loaned-bg)', text: 'var(--status-loaned-text)' },
  maintenance: { bg: 'var(--status-maintenance-bg)', text: 'var(--status-maintenance-text)' },
};

export const TYPE_LABELS = {
  salon: 'Salón',
  lab: 'Laboratorio',
  equipment: 'Equipo',
};

export const RESERVATION_STATUS_LABELS = {
  confirmed: 'Confirmada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
};

export const LOAN_STATUS_LABELS = {
  active: 'Activo',
  overdue: 'Con retraso',
  returned: 'Devuelto',
};
