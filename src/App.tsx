import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AppLayout } from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ExecutiveDashboard from './pages/ExecutiveDashboard';
import Customers from './pages/Customers';
import Sales from './pages/Sales';
import SalesReport from './pages/SalesReport';
import PurchaseReport from './pages/PurchaseReport';
import Users from './pages/Users';
import Suppliers from './pages/Suppliers';
import SaleDetails from './pages/SaleDetails';
import Purchases from './pages/Purchases';
import PurchaseDetails from './pages/PurchaseDetails';
import PurchaseView from './pages/PurchaseView';
import CustomerOutstanding from './pages/CustomerOutstanding';
import DailyLedger from './pages/DailyLedger';
import FreightInvoices from './pages/FreightInvoices';
import FreightInvoiceForm from './pages/FreightInvoiceForm';
import FreightInvoiceDetails from './pages/FreightInvoiceDetails';
import TransportInvoices from './pages/TransportInvoices';
import TransportInvoiceForm from './pages/TransportInvoiceForm';
import TransportInvoiceDetails from './pages/TransportInvoiceDetails';
import DubaiTransportInvoices from './pages/DubaiTransportInvoices';
import DubaiTransportInvoiceForm from './pages/DubaiTransportInvoiceForm';
import DubaiTransportDetails from './pages/DubaiTransportDetails';
import DubaiClearanceInvoices from './pages/DubaiClearanceInvoices';
import DubaiClearanceInvoiceForm from './pages/DubaiClearanceInvoiceForm';
import DubaiClearanceDetails from './pages/DubaiClearanceDetails';
import Statement from './pages/Statement';
import ManualStatement from './pages/ManualStatement';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import LoadingSpinner from './components/LoadingSpinner';


const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner size="fullscreen" variant="spinner" message="Initializing application..." />;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Restrict routes by role(s)
const RoleRoute: React.FC<{ children: React.ReactNode; roles: Array<'admin' | 'employee'> } > = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return <LoadingSpinner size="fullscreen" variant="spinner" message="Initializing application..." />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (!user || !roles.includes(user.role as any)) {
    // If employee tries to access restricted pages, redirect to allowed entry point
    return <Navigate to={user?.role === 'employee' ? '/sales/new' : '/dashboard'} />;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route
          path="/dashboard"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/executive-dashboard"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <ExecutiveDashboard />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Customers />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Suppliers />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Sales />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Purchases />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/purchases/new"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <PurchaseDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/purchases/:id"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <PurchaseView />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/purchases/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <PurchaseDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/sales/new"
          element={
            <RoleRoute roles={['admin','employee']}>
              <AppLayout>
                <SaleDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/sales/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <SaleDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <SaleDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/sales-report"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <SalesReport />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/purchase-report"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <PurchaseReport />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/customer-outstanding"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <CustomerOutstanding />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/daily-ledger"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DailyLedger />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Users />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Settings />
              </AppLayout>
            </RoleRoute>
          }
        />
        {/* Freight Invoice Routes */}
        <Route
          path="/freight-invoices"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <FreightInvoices />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/freight-invoices/new"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <FreightInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/freight-invoices/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <FreightInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/freight-invoices/:id"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <FreightInvoiceDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        {/* Transport Invoice Routes */}
        <Route
          path="/transport-invoices"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <TransportInvoices />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/transport-invoices/new"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <TransportInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/transport-invoices/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <TransportInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/transport-invoices/:id"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <TransportInvoiceDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        {/* Dubai Transport Invoice Routes */}
        <Route
          path="/dubai-transport-invoices"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiTransportInvoices />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/dubai-transport-invoices/new"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiTransportInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/dubai-transport-invoices/:id"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiTransportDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/dubai-transport-invoices/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiTransportInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        {/* Dubai Clearance Invoice Routes */}
        <Route
          path="/dubai-clearance-invoices"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiClearanceInvoices />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/dubai-clearance-invoices/:id"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiClearanceDetails />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/dubai-clearance-invoices/new"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiClearanceInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/dubai-clearance-invoices/:id/edit"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <DubaiClearanceInvoiceForm />
              </AppLayout>
            </RoleRoute>
          }
        />
        {/* Statement Routes */}
        <Route
          path="/statement"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Statement />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route
          path="/statement/manual"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <ManualStatement />
              </AppLayout>
            </RoleRoute>
          }
        />
        {/* Notifications Route */}
        <Route
          path="/notifications"
          element={
            <RoleRoute roles={['admin']}>
              <AppLayout>
                <Notifications />
              </AppLayout>
            </RoleRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <AuthProvider>
          <LoadingProvider>
            <SidebarProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </SidebarProvider>
          </LoadingProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
