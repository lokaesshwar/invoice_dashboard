import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Avatar,
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BarChartIcon from '@mui/icons-material/BarChart';

const DRAWER_WIDTH = 220;

const navItems = [
  { label: 'Invoices', path: '/invoices', icon: <ReceiptLongIcon /> },
  { label: 'Summary', path: '/summary', icon: <BarChartIcon /> },
];

export default function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid #e8ecf0',
            background: '#fff',
          },
        }}
      >
        {/* Logo */}
        <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 34, height: 34, borderRadius: 2 }}>
            <ReceiptLongIcon sx={{ fontSize: 18 }} />
          </Avatar>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', color: '#1a1d23' }}>
            InvoiceApp
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#f0f2f5' }} />

        <List sx={{ px: 1.5, pt: 1.5 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                color: '#64748b',
                '&.active': {
                  bgcolor: '#eff6ff',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                },
                '&:hover': { bgcolor: '#f8fafc' },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3, minWidth: 0, background: '#f5f6fa', minHeight: '100vh' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
