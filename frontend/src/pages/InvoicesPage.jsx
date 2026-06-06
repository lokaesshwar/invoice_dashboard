import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TableSortLabel, TablePagination, IconButton, Tooltip, Stack,
  Skeleton, Collapse, InputAdornment, Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import { useInvoices, useDeleteInvoice } from '../hooks/useInvoices';
import StatusChip from '../components/StatusChip';
import InvoiceFormModal from '../components/InvoiceFormModal';

const STATUSES = ['', 'Sent', 'Unpaid', 'Overdue', 'Paid', 'Void', 'Draft'];
const TAX_RATES = ['', '0', '3', '5', '18', '28'];

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function InvoicesPage() {
  const navigate = useNavigate();
  const deleteMutation = useDeleteInvoice();

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [issueDateFrom, setIssueDateFrom] = useState('');
  const [issueDateTo, setIssueDateTo] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sort
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);

  const queryParams = {
    page: page + 1,
    limit: rowsPerPage,
    ...(search && { search }),
    ...(status && { status }),
    ...(taxRate && { taxRate }),
    ...(sortBy && { sortBy, sortOrder }),
    ...(issueDateFrom && { issueDateFrom }),
    ...(issueDateTo && { issueDateTo }),
    ...(dueDateFrom && { dueDateFrom }),
    ...(dueDateTo && { dueDateTo }),
  };

  const { data, isLoading } = useInvoices(queryParams);
  const invoices = data?.data || [];
  const total = data?.pagination?.total || 0;

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this invoice?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const openCreate = () => { setEditInvoice(null); setModalOpen(true); };
  const openEdit = (inv) => { setEditInvoice(inv); setModalOpen(true); };

  const activeFilterCount = [status, taxRate, issueDateFrom, issueDateTo, dueDateFrom, dueDateTo].filter(Boolean).length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Invoices</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {total.toLocaleString()} total records
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            color={activeFilterCount ? 'primary' : 'inherit'}
          >
            Filters {activeFilterCount > 0 && <Chip label={activeFilterCount} size="small" sx={{ ml: 0.5, height: 18 }} />}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            New Invoice
          </Button>
        </Stack>
      </Box>

      {/* Search + Filter panel */}
      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by invoice ID or customer name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" sx={{ color: 'text.disabled' }} /></InputAdornment>,
          }}
          sx={{ mb: showFilters ? 2 : 0 }}
        />

        <Collapse in={showFilters}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 1.5 }}>
            <TextField select size="small" label="Status" value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
              {STATUSES.map((s) => <MenuItem key={s} value={s}>{s || 'All Statuses'}</MenuItem>)}
            </TextField>

            <TextField select size="small" label="Tax Rate" value={taxRate}
              onChange={(e) => { setTaxRate(e.target.value); setPage(0); }}>
              {TAX_RATES.map((r) => <MenuItem key={r} value={r}>{r === '' ? 'All Rates' : `${r}%`}</MenuItem>)}
            </TextField>

            <TextField size="small" label="Issue Date From" type="date" InputLabelProps={{ shrink: true }}
              value={issueDateFrom} onChange={(e) => { setIssueDateFrom(e.target.value); setPage(0); }} />
            <TextField size="small" label="Issue Date To" type="date" InputLabelProps={{ shrink: true }}
              value={issueDateTo} onChange={(e) => { setIssueDateTo(e.target.value); setPage(0); }} />
            <TextField size="small" label="Due Date From" type="date" InputLabelProps={{ shrink: true }}
              value={dueDateFrom} onChange={(e) => { setDueDateFrom(e.target.value); setPage(0); }} />
            <TextField size="small" label="Due Date To" type="date" InputLabelProps={{ shrink: true }}
              value={dueDateTo} onChange={(e) => { setDueDateTo(e.target.value); setPage(0); }} />
          </Box>
        </Collapse>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Company</TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortBy === 'amount'}
                    direction={sortBy === 'amount' ? sortOrder : 'desc'}
                    onClick={() => handleSort('amount')}
                  >Amount</TableSortLabel>
                </TableCell>
                <TableCell align="right">Tax%</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'dueDate'}
                    direction={sortBy === 'dueDate' ? sortOrder : 'desc'}
                    onClick={() => handleSort('dueDate')}
                  >Due Date</TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((__, j) => (
                        <TableCell key={j}><Skeleton height={20} /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : invoices.map((inv) => (
                    <TableRow
                      key={inv._id}
                      hover
                      sx={{ '&:last-child td': { borderBottom: 0 }, cursor: 'default' }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontFamily="'DM Mono', monospace" fontSize="0.78rem" color="primary.main">
                          {inv.invoiceId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2" fontWeight={500}
                          sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                          onClick={() => navigate(`/customers/${inv.customer?._id}`)}
                        >
                          {inv.customer?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{inv.customer?.company}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="'DM Mono', monospace" fontSize="0.8rem">
                          {fmt(inv.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="text.secondary">{inv.taxRate}%</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontFamily="'DM Mono', monospace" fontSize="0.8rem" fontWeight={600}>
                          {fmt(inv.total)}
                        </Typography>
                      </TableCell>
                      <TableCell><StatusChip status={inv.status} /></TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">{fmtDate(inv.dueDate)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(inv)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDelete(inv._id)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </Paper>

      <InvoiceFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        invoice={editInvoice}
      />
    </Box>
  );
}
