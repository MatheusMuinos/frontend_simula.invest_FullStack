import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.homePage}>
      <header className={styles.header}>
        <nav className={styles.navbar}>
          <div className={styles.logo}>Simula<span>Invest</span></div>
          <div className={styles.actions}>
            <button onClick={() => navigate('/login')} className={styles.secondaryButton}>
              Login
            </button>
            <button onClick={() => navigate('/register')} className={styles.primaryButton}>
              Registrar-se
            </button>
          </div>
        </nav>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Bem-vindo ao SimulaInvest</h1>
          <p className={styles.heroDescription}>
            Sua plataforma para simular investimentos, analisar portfólios e tomar decisões financeiras informadas.
          </p>
        </section>

        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Funcionalidades</h2>
          <ul className={styles.featuresList}>
            <li>Simulação de cenários de investimento.</li>
            <li>Análise detalhada de portfólio.</li>
            <li>Comparação de estratégias financeiras.</li>
            <li>Relatórios personalizados.</li>
          </ul>
        </section>

        <section className={styles.benefitsSection}>
          <h2 className={styles.sectionTitle}>Por que usar o SimulaInvest?</h2>
          <p>
            Com o SimulaInvest, você pode planejar seus investimentos com confiança, reduzir riscos e alcançar seus objetivos financeiros.
          </p>
        </section>

        <div className={styles.ctaSection}>
          <button onClick={() => navigate('/register')} className={styles.ctaButton}>
            Comece Agora
          </button>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} SimulaInvest. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};