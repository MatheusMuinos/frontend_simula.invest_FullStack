import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthApp } from './AuthApp.tsx';
import { AuthProvider } from './auth/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { LanguageProvider } from './context/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <AuthApp />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);