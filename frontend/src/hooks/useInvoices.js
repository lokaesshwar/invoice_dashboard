import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api';

export const useInvoices = (params) =>
  useQuery({
    queryKey: ['invoices', params],
    queryFn: () => api.getInvoices(params),
    keepPreviousData: true,
  });

export const useInvoice = (id) =>
  useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.getInvoice(id),
    enabled: !!id,
  });

export const useSummary = () =>
  useQuery({
    queryKey: ['summary'],
    queryFn: api.getSummary,
  });

export const useCustomers = () =>
  useQuery({
    queryKey: ['customers'],
    queryFn: api.getCustomers,
  });

export const useCustomerProfile = (id) =>
  useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.getCustomerProfile(id),
    enabled: !!id,
  });

export const useCreateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.updateInvoice(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });
};

export const useDeleteInvoice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.deleteInvoice,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['summary'] });
    },
  });
};
