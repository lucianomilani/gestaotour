import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { BookingDetails } from './pages/BookingDetails';
import { Analytics } from './pages/Analytics';
import { BookingsList } from './pages/BookingsList';
import { Calendar } from './pages/Calendar';
import { Login } from './pages/Login';
import { AgenciesList } from './pages/AgenciesList';
import { StaffList } from './pages/StaffList';
import { AdventuresList } from './pages/AdventuresList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route - No Layout */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes - Wrapped in Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<BookingsList />} />
            <Route path="bookings/new" element={<Navigate to="/bookings" replace />} /> {/* Placeholder for now */}
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="adventures" element={<AdventuresList />} />
            <Route path="agencies" element={<AgenciesList />} />
            <Route path="staff" element={<StaffList />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;