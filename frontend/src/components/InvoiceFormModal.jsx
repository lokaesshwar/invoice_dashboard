import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Grid, Box, Typography,
  CircularProgress, Alert,
} from '@mui/material';
import { useCreateInvoice, useUpdateInvoice, useCustomers } from '../hooks/useInvoices';

const TAX_RATES = [0, 3, 5, 18, 28];
const STATUSES = ['Draft', 'Sent', 'Paid', 'Unpaid', 'Overdue', 'Void'];

const EMPTY = {
  customerId: '',
  amount: '',
  taxRate: 18,
  issueDate: '',
  dueDate: '',
  status: 'Draft',
};

export default function InvoiceFormModal({ open, onClose, invoice }) {
  const isEdit = !!invoice;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const { data: customers = [] } = useCustomers();
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  const loading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (invoice) {
      setForm({
        customerId: invoice.customer?._id || invoice.customer || '',
        amount: invoice.amount,
        taxRate: invoice.taxRate,
        issueDate: invoice.issueDate?.slice(0, 10) || '',
        dueDate: invoice.dueDate?.slice(0, 10) || '',
        status: invoice.status,
      });
    } else {
      setForm(EMPTY);
    }
    setError('');
  }, [invoice, open]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const computedTax = form.amount && form.taxRate !== ''
    ? ((parseFloat(form.amount) * parseFloat(form.taxRate)) / 100).toFixed(2)
    : '0.00';
  const computedTotal = form.amount
    ? (parseFloat(form.amount) + parseFloat(computedTax)).toFixed(2)
    : '0.00';

  const handleSubmit = async () => {
    if (!form.customerId || !form.amount || !form.issueDate || !form.dueDate) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: invoice._id, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {isEdit ? 'Edit Invoice' : 'New Invoice'}
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              select fullWidth required
              label="Customer"
              name="customerId"
              value={form.customerId}
              onChange={handleChange}
              size="small"
            >
              {customers.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name} — {c.company}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth required
              label="Amount (₹)"
              name="amount"
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              value={form.amount}
              onChange={handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select fullWidth required
              label="Tax Rate (%)"
              name="taxRate"
              value={form.taxRate}
              onChange={handleChange}
              size="small"
            >
              {TAX_RATES.map((r) => (
                <MenuItem key={r} value={r}>{r}%</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth required
              label="Issue Date"
              name="issueDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.issueDate}
              onChange={handleChange}
              size="small"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth required
              label="Due Date"
              name="dueDate"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.dueDate}
              onChange={handleChange}
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select fullWidth
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              size="small"
            >
              {STATUSES.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        {/* Computed preview */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, display: 'flex', gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Tax: <strong>₹{computedTax}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Total: <strong>₹{computedTotal}</strong>
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : null}
        >
          {isEdit ? 'Update' : 'Save Invoice'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
