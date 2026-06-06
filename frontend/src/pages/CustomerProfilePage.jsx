import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Avatar, Chip, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
  Skeleton, IconButton, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useCustomerProfile } from '../hooks/useInvoices';
import StatusChip from '../components/StatusChip';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const initials = (name) => name?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

function MetricCard({ label, value, loading, accent }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
        {label.toUpperCase()}
      </Typography>
      {loading ? (
        <Skeleton width={80} height={28} />
      ) : (
        <Typography variant="h6" fontWeight={700} color={accent || 'text.primary'}>{value}</Typography>
      )}
    </Paper>
  );
}

export default function CustomerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useCustomerProfile(id);

  const m = profile?.metrics;

  const statusCounts = [
    { label: 'Paid', value: m?.paid || 0, color: 'success' },
    { label: 'Unpaid', value: m?.unpaid || 0, color: 'warning' },
    { label: 'Overdue', value: m?.overdue || 0, color: 'error' },
    { label: 'Draft', value: m?.draft || 0, color: 'default' },
  ];

  return (
    <Box>
      {/* Breadcrumb */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <Tooltip title="Back to Invoices">
          <IconButton size="small" onClick={() => navigate('/invoices')}>
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography variant="body2" color="text.secondary">
          Invoices /
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {isLoading ? <Skeleton width={120} /> : profile?.name}
        </Typography>
      </Stack>

      {/* Profile header */}
      <Paper sx={{ p: 3, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          {isLoading ? (
            <Skeleton variant="circular" width={56} height={56} />
          ) : (
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.1rem', fontWeight: 700, borderRadius: 2 }}>
              {initials(profile?.name)}
            </Avatar>
          )}
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {isLoading ? <Skeleton width={180} /> : profile?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isLoading ? <Skeleton width={130} /> : profile?.company}
            </Typography>
          </Box>
        </Stack>

        {/* Metrics */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Total Billed" value={m ? fmt(m.totalBilled) : '—'} loading={isLoading} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Total Tax" value={m ? fmt(m.totalTax) : '—'} loading={isLoading} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="Outstanding" value={m ? fmt(m.outstanding) : '—'} loading={isLoading} accent={m?.outstanding > 0 ? '#dc2626' : undefined} />
          </Grid>
          <Grid item xs={6} sm={3}>
            <MetricCard label="# Invoices" value={m?.invoiceCount || '—'} loading={isLoading} />
          </Grid>
        </Grid>

        {/* Status breakdown */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {statusCounts.map((s) => (
            <Chip
              key={s.label}
              label={`${s.label}: ${s.value}`}
              color={s.color}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
            />
          ))}
        </Stack>
      </Paper>

      {/* Invoice history */}
      <Paper>
        <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>Invoice History</Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell align="right">Tax%</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Issued</TableCell>
              <TableCell>Due</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <TableCell key={j}><Skeleton height={20} /></TableCell>
                    ))}
                  </TableRow>
                ))
              : (profile?.invoices || []).map((inv) => (
                  <TableRow key={inv._id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontFamily="'DM Mono', monospace" fontSize="0.78rem" color="primary.main">
                        {inv.invoiceId}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontFamily="'DM Mono', monospace" fontSize="0.78rem">{fmt(inv.amount)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" color="text.secondary">{inv.taxRate}%</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontFamily="'DM Mono', monospace" fontSize="0.8rem" fontWeight={600}>{fmt(inv.total)}</Typography>
                    </TableCell>
                    <TableCell><StatusChip status={inv.status} /></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{fmtDate(inv.issueDate)}</Typography></TableCell>
                    <TableCell><Typography variant="body2" color="text.secondary">{fmtDate(inv.dueDate)}</Typography></TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
