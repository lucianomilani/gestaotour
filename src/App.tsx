import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ModalProvider } from './context/ModalContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { BookingDetails } from './pages/BookingDetails';
import { Analytics } from './pages/Analytics';
import { BookingsList } from './pages/BookingsList';
import { Calendar } from './pages/Calendar';
import { Login } from './pages/Login';
import { AgenciesList } from './pages/AgenciesList';
import { StaffList } from './pages/StaffList';
import { AdventuresList } from './pages/AdventuresList';
import { PaymentMethodsList } from './pages/PaymentMethodsList';
import { CompanySettings } from './pages/CompanySettings';
import { CompaniesList } from './pages/CompaniesList';
import { BookingForm } from './pages/public/BookingForm';
import { BookingLanding } from './pages/public/BookingLanding';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ModalProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/new-booking" element={<BookingLanding />} />
              <Route path="/book" element={<BookingForm />} />
              <Route path="/book/private" element={<BookingForm />} />
              <Route path="/book/agency" element={<BookingForm />} />

              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bookings" element={<BookingsList />} />
                <Route path="/bookings/:id" element={<BookingDetails />} />
                <Route path="/adventures" element={<AdventuresList />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/staff" element={<StaffList />} />
                <Route path="/agencies" element={<AgenciesList />} />
                <Route path="/payment-methods" element={<PaymentMethodsList />} />
                <Route path="/company-settings" element={<CompanySettings />} />
                <Route path="/companies" element={<CompaniesList />} />
                <Route path="/analytics" element={<Analytics />} />
                {/* <Route path="/financial" element={<Financial />} /> */}
                {/* <Route path="/settings" element={<Settings />} /> */}
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ModalProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;