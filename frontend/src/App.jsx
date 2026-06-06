import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import MainLayout from './layouts/MainLayout';
import InvoicesPage from './pages/InvoicesPage';
import SummaryPage from './pages/SummaryPage';
import CustomerProfilePage from './pages/CustomerProfilePage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/invoices" replace />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="summary" element={<SummaryPage />} />
            <Route path="customers/:id" element={<CustomerProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
