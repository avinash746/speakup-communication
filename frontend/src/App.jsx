import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import AnalysisDetailPage from './pages/AnalysisDetailPage';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const LoadingScreen = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: 'var(--bg)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: 48, height: 48, border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
      }} />
      <p style={{ color: 'var(--text-muted)', fontFamily: 'DM Mono', fontSize: 13 }}>Loading SpeakUp…</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/history/:id" element={<AnalysisDetailPage />} />
      </Route>
    </Routes>
  );
}
