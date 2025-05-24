// src/auth/Register.tsx
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Auth.module.css';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      await register({ name, email, password });
      navigate('/'); // Redireciona para a página principal após registro
    } catch (err) {
      setError('Erro ao cadastrar. Tente novamente.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h2 className={styles.authTitle}>Crie sua conta</h2>
        
        {error && <div className={styles.authError}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Nome completo</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.authInput}
              placeholder="Seu nome"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.authInput}
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={styles.authInput}
              placeholder="••••••"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirme sua senha</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className={styles.authInput}
              placeholder="••••••"
            />
          </div>

          <button type="submit" className={styles.authButton}>
            Cadastrar
          </button>
        </form>

        <div className={styles.authFooter}>
          <span>Já tem uma conta?</span>
          <Link to="/login" className={styles.authLink}>
            Faça login
          </Link>
        </div>
      </div>
    </div>
  );
}