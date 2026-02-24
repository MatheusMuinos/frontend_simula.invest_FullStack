import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import App from './App';
import { LandingPage } from './pages/LandingPage';

export function AuthApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Verificando autenticação...</div>;
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<LandingPage />} 
      />
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/app" replace />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/app" replace />} 
      />
      <Route 
        path="/app" 
        element={isAuthenticated ? <App /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
}