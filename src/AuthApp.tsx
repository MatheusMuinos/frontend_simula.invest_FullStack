// src/AuthApp.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { Login } from './auth/Login';
import { Register } from './auth/Register';
import App from './App'; // Sua tela atual (área logada)

export function AuthApp() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} />
      
      {/* Rota principal (área logada) */}
      <Route 
        path="/" 
        element={isAuthenticated ? <App /> : <Navigate to="/login" replace />} 
      />
      
      {/* Redirecionamento para páginas não encontradas */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}