import { Chip } from '@mui/material';

const STATUS_CONFIG = {
  Paid:    { color: 'success', variant: 'filled' },
  Unpaid:  { color: 'warning', variant: 'filled' },
  Overdue: { color: 'error',   variant: 'filled' },
  Sent:    { color: 'info',    variant: 'filled' },
  Draft:   { color: 'default', variant: 'filled' },
  Void:    { color: 'default', variant: 'outlined' },
};

export default function StatusChip({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: 'default', variant: 'filled' };
  return (
    <Chip
      label={status}
      color={cfg.color}
      variant={cfg.variant}
      size="small"
      sx={{ fontWeight: 600, fontSize: '0.68rem', letterSpacing: '0.02em' }}
    />
  );
}
