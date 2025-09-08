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
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/executive-dashboard"
          element={
            <PrivateRoute>
              <AppLayout>
                <ExecutiveDashboard />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <PrivateRoute>
              <AppLayout>
                <Customers />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <PrivateRoute>
              <AppLayout>
                <Suppliers />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales"
          element={
            <PrivateRoute>
              <AppLayout>
                <Sales />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases"
          element={
            <PrivateRoute>
              <AppLayout>
                <Purchases />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <PurchaseDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <PurchaseView />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchases/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <PurchaseDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <SaleDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <SaleDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <SaleDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/sales-report"
          element={
            <PrivateRoute>
              <AppLayout>
                <SalesReport />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/purchase-report"
          element={
            <PrivateRoute>
              <AppLayout>
                <PurchaseReport />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/customer-outstanding"
          element={
            <PrivateRoute>
              <AppLayout>
                <CustomerOutstanding />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/daily-ledger"
          element={
            <PrivateRoute>
              <AppLayout>
                <DailyLedger />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <AppLayout>
                <Users />
              </AppLayout>
            </PrivateRoute>
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
            <PrivateRoute>
              <AppLayout>
                <Settings />
              </AppLayout>
            </PrivateRoute>
          }
        />
        {/* Freight Invoice Routes */}
        <Route
          path="/freight-invoices"
          element={
            <PrivateRoute>
              <AppLayout>
                <FreightInvoices />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/freight-invoices/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <FreightInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/freight-invoices/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <FreightInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/freight-invoices/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <FreightInvoiceDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        {/* Transport Invoice Routes */}
        <Route
          path="/transport-invoices"
          element={
            <PrivateRoute>
              <AppLayout>
                <TransportInvoices />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/transport-invoices/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <TransportInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/transport-invoices/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <TransportInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/transport-invoices/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <TransportInvoiceDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        {/* Dubai Transport Invoice Routes */}
        <Route
          path="/dubai-transport-invoices"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiTransportInvoices />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dubai-transport-invoices/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiTransportInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dubai-transport-invoices/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiTransportDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dubai-transport-invoices/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiTransportInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        {/* Dubai Clearance Invoice Routes */}
        <Route
          path="/dubai-clearance-invoices"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiClearanceInvoices />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dubai-clearance-invoices/:id"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiClearanceDetails />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dubai-clearance-invoices/new"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiClearanceInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/dubai-clearance-invoices/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout>
                <DubaiClearanceInvoiceForm />
              </AppLayout>
            </PrivateRoute>
          }
        />
        {/* Statement Route */}
        <Route
          path="/statement"
          element={
            <PrivateRoute>
              <AppLayout>
                <Statement />
              </AppLayout>
            </PrivateRoute>
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
              <AppContent />
            </SidebarProvider>
          </LoadingProvider>
        </AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default App;
