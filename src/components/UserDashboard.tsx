// src/components/UserDashboard.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { mockHistory } from '../mocks/history';
import styles from './Dashboard.module.css';
import './PortfolioOverview'

export const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('historico');
  const [simulations, setSimulations] = useState<any[]>([]);

  useEffect(() => {
    // Mock: Carrega o histórico do usuário
    setSimulations(mockHistory.filter(s => s.userId === 'mock-user-id'));
  }, []);

  const handleDeleteSimulation = (id: string) => {
    setSimulations(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <h2>Olá, {user?.name}!</h2>
        <button onClick={logout} className={styles.logoutButton}>
          Sair
        </button>
      </header>

      <nav className={styles.dashboardNav}>
        <button
          className={`${styles.navButton} ${activeTab === 'historico' ? styles.active : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          Histórico
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'investimentos' ? styles.active : ''}`}
          onClick={() => setActiveTab('investimentos')}
        >
          Meus Investimentos
        </button>
      </nav>

      <div className={styles.dashboardContent}>
        {activeTab === 'historico' ? (
          <div className={styles.historySection}>
            <h3>Últimas Simulações</h3>
            {simulations.length > 0 ? (
              <ul className={styles.simulationList}>
                {simulations.map((sim) => (
                  <SimulationCard 
                    key={sim.id} 
                    simulation={sim} 
                    onDelete={handleDeleteSimulation}
                  />
                ))}
              </ul>
            ) : (
              <p className={styles.emptyMessage}>Nenhuma simulação encontrada</p>
            )}
          </div>
        ) : (
          <div className={styles.investmentsSection}>
          </div>
        )}
      </div>
    </div>
  );
};

const SimulationCard = ({ simulation, onDelete }: { simulation: any, onDelete: (id: string) => void }) => {
  return (
    <li className={styles.simulationCard}>
      <div className={styles.simulationInfo}>
        <span className={styles.simulationTitle}>{simulation.symbol}</span>
        <span>Valor: ${simulation.amount.toFixed(2)}</span>
        <span>Resultado: ${simulation.result.toFixed(2)}</span>
      </div>
      <button 
        onClick={() => onDelete(simulation.id)}
        className={styles.deleteButton}
      >
        Excluir
      </button>
    </li>
  );
};