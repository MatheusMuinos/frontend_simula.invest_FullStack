import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useSimulations, Simulation } from '../hooks/useSimulations';
import { ResimulateModal } from './ResimulateModal';
import { PortfolioOverview } from './PortfolioOverview';
import { Loader } from './Loader';
import styles from './Dashboard.module.css';

const formatCurrency = (value: number): string => 
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const UserDashboard: React.FC = () => {
  const { user } = useAuth(); 
  const { simulations, isLoading, error, fetchSimulations, updateSimulation, deleteSimulation } = useSimulations();
  const [activeTab, setActiveTab] = useState<'historico' | 'investimentos'>('historico');
  const [editingSimulation, setEditingSimulation] = useState<Simulation | null>(null);

  useEffect(() => {
    if (user && activeTab === 'historico') {
      fetchSimulations();
    }
  }, [user, activeTab, fetchSimulations]);

  const handleDelete = async (simulationId: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta simulação?")) {
      try { await deleteSimulation(simulationId); } catch (e) { console.error(e); }
    }
  };

  const handleUpdate = async (updatedInputs: Partial<Simulation>) => {
    if (!editingSimulation) return;
    try {
      await updateSimulation({ simulationId: editingSimulation.id, ...updatedInputs });
      setEditingSimulation(null);
    } catch (e) { console.error(e); }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Painel do Investidor</h2>
      <nav className={styles.dashboardNav}>
        <button
          className={`${styles.navButton} ${activeTab === 'historico' ? styles.active : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          Histórico de Simulações
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'investimentos' ? styles.active : ''}`}
          onClick={() => setActiveTab('investimentos')}
        >
          Meu Portfólio <span className={styles.wipTag}>(Em Breve)</span>
        </button>
      </nav>
      <div className={styles.dashboardContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {activeTab === 'historico' && (
          isLoading && !editingSimulation ? <Loader /> : (
            <div className={styles.historySection}>
              <h3>Suas Simulações Salvas</h3>
              {simulations.length > 0 ? (
                <ul className={styles.simulationList}>
                  {simulations.map((sim) => (
                    <SimulationCard key={sim.id} simulation={sim} onDelete={handleDelete} onEdit={setEditingSimulation} />
                  ))}
                </ul>
              ) : (!isLoading && <p className={styles.emptyMessage}>Você ainda não tem simulações salvas.</p>)}
            </div>
          )
        )}
        {activeTab === 'investimentos' && <PortfolioOverview />}
      </div>
      {editingSimulation && <ResimulateModal simulation={editingSimulation} onSave={handleUpdate} onClose={() => setEditingSimulation(null)} />}
    </div>
  );
};

const SimulationCard: React.FC<{ simulation: Simulation; onDelete: (id: number) => void; onEdit: (simulation: Simulation) => void; }> = ({ simulation, onDelete, onEdit }) => (
  <li className={styles.simulationCard}>
    <div className={styles.simulationInfo}>
      <strong>{simulation.tipo === 'acao' ? `Ação: ${simulation.nome}` : `Renda Fixa: ${simulation.nome}`}</strong>
      <span>Data: {new Date(simulation.createdAt).toLocaleDateString('pt-BR')}</span>
      <span>Invest. Inicial: {formatCurrency(simulation.invest_inicial)}</span>
      <span>Invest. Mensal: {formatCurrency(simulation.invest_mensal)}</span>
      <span>Período: {simulation.meses} meses</span>
    </div>
    <div className={styles.cardActions}>
      <button onClick={() => onEdit(simulation)} className={`${styles.actionButton} ${styles.editButton}`}>Editar</button>
      <button onClick={() => onDelete(simulation.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>Excluir</button>
    </div>
  </li>
);