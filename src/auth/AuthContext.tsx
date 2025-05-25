// src/auth/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Recupera o usuário do localStorage ao inicializar
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('simulainvest_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Atualiza o localStorage sempre que o usuário mudar
  useEffect(() => {
    if (user) {
      localStorage.setItem('simulainvest_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('simulainvest_user');
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Mock: Validação básica (substituir por chamada API depois)
    if (!email.includes('@') || password.length < 6) {
      throw new Error('Credenciais inválidas');
    }

    const mockUser = {
      id: 'mock-user-' + Date.now(),
      name: email.split('@')[0] || 'Investidor',
      email
    };
    
    setUser(mockUser);
  };

  const register = async (userData: { name: string; email: string; password: string }) => {
    // Mock: Validação básica
    if (userData.password.length < 6) {
      throw new Error('Senha deve ter 6+ caracteres');
    }

    const mockUser = {
      id: 'mock-user-' + Date.now(),
      name: userData.name,
      email: userData.email
    };
    
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}