import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Grid, Skeleton, Stack,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useSummary } from '../hooks/useInvoices';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => {
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + 'Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + 'L';
  return fmt(n);
};

const COLORS = ['#2563eb', '#7c3aed', '#0891b2', '#16a34a', '#d97706'];

function StatCard({ icon, label, value, color, loading }) {
  return (
    <Paper sx={{ p: 2.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mb: 0.75 }}>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={100} height={36} />
          ) : (
            <Typography variant="h5" fontWeight={700}>{value}</Typography>
          )}
        </Box>
        <Box sx={{
          width: 44, height: 44, borderRadius: 2,
          bgcolor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Box sx={{ color }}>{icon}</Box>
        </Box>
      </Stack>
    </Paper>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Paper sx={{ p: 1.5, border: '1px solid #e2e8f0' }}>
      <Typography variant="body2" fontWeight={600}>{label}</Typography>
      <Typography variant="body2" color="text.secondary">
        Total Billed: {fmtShort(payload[0]?.value || 0)}
      </Typography>
    </Paper>
  );
};

export default function SummaryPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useSummary();

  const chartData = (data?.topCustomers || []).map((c) => ({
    name: c.name.split(' ')[0],
    fullName: c.name,
    totalBilled: c.totalBilled,
    invoiceCount: c.invoiceCount,
    company: c.company,
    id: c._id,
  }));

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>Summary</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Analytics across all invoices and customers
      </Typography>

      {/* Stat cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUpIcon />}
            label="Total Billed"
            value={data ? fmtShort(data.totalBilled) : '—'}
            color="#2563eb"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccountBalanceWalletIcon />}
            label="Total Tax"
            value={data ? fmtShort(data.totalTax) : '—'}
            color="#7c3aed"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<ReceiptIcon />}
            label="Total Invoices"
            value={data ? data.invoiceCount.toLocaleString() : '—'}
            color="#0891b2"
            loading={isLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<PeopleIcon />}
            label="Total Customers"
            value={data ? data.customerCount : '—'}
            color="#16a34a"
            loading={isLoading}
          />
        </Grid>
      </Grid>

      {/* Chart + Table */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Top 5 Customers by Billed Value
            </Typography>
            {isLoading ? (
              <Skeleton height={280} variant="rectangular" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'DM Sans' }} />
                  <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fontFamily: 'DM Sans' }} width={70} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalBilled" radius={[6, 6, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, height: '100%' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Top 5 Customers
            </Typography>
            {isLoading ? (
              <Stack spacing={1}>
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={40} />)}
              </Stack>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Billed</TableCell>
                    <TableCell align="right">Invoices</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data?.topCustomers || []).map((c, i) => (
                    <TableRow
                      key={c._id}
                      hover
                      sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                      onClick={() => navigate(`/customers/${c._id}`)}
                    >
                      <TableCell>
                        <Box sx={{
                          width: 24, height: 24, borderRadius: '50%',
                          bgcolor: COLORS[i] + '20', color: COLORS[i],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 700, fontSize: '0.72rem',
                        }}>
                          {i + 1}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{c.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.company}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="'DM Mono', monospace" fontSize="0.78rem">
                          {fmtShort(c.totalBilled)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">{c.invoiceCount}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
