import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Invoices ──────────────────────────────────────────────
export const getInvoices = (params) => api.get('/invoices', { params }).then((r) => r.data);
export const getInvoice = (id) => api.get(`/invoices/${id}`).then((r) => r.data);
export const getSummary = () => api.get('/invoices/summary').then((r) => r.data);
export const createInvoice = (data) => api.post('/invoices', data).then((r) => r.data);
export const updateInvoice = (id, data) => api.put(`/invoices/${id}`, data).then((r) => r.data);
export const deleteInvoice = (id) => api.delete(`/invoices/${id}`).then((r) => r.data);

// ── Customers ─────────────────────────────────────────────
export const getCustomers = () => api.get('/customers').then((r) => r.data);
export const getCustomerProfile = (id) => api.get(`/customers/${id}`).then((r) => r.data);
