import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

// Layout
import AdminLayout from './layouts/AdminLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import SocietyPage from './pages/society/SocietyPage';
import BlocksPage from './pages/blocks/BlocksPage';
import FlatsPage from './pages/flats/FlatsPage';
import MembersPage from './pages/members/MembersPage';
import BillsPage from './pages/bills/BillsPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ComplaintsPage from './pages/complaints/ComplaintsPage';
import NoticesPage from './pages/notices/NoticesPage';
import VisitorsPage from './pages/visitors/VisitorsPage';
import StaffPage from './pages/staff/StaffPage';
import AmenitiesPage from './pages/amenities/AmenitiesPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
    },
    secondary: {
      main: '#0F172A',
      light: '#1E293B',
      dark: '#0F172A',
    },
    success: {
      main: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
    },
    error: {
      main: '#EF4444',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

function App() {
  const isAuthenticated = true; // Mock authentication

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {isAuthenticated ? (
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="society" element={<SocietyPage />} />
              <Route path="blocks" element={<BlocksPage />} />
              <Route path="flats" element={<FlatsPage />} />
              <Route path="members" element={<MembersPage />} />
              <Route path="bills" element={<BillsPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="complaints" element={<ComplaintsPage />} />
              <Route path="notices" element={<NoticesPage />} />
              <Route path="visitors" element={<VisitorsPage />} />
              <Route path="staff" element={<StaffPage />} />
              <Route path="amenities" element={<AmenitiesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
