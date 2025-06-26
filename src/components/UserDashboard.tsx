import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useSimulations, Simulation } from '../hooks/useSimulations';
import { ResimulateModal } from './ResimulateModal';
import { PortfolioOverview } from './PortfolioOverview';
import { Loader } from './Loader';
import styles from './Dashboard.module.css';
import { useLanguage } from '../context/LanguageContext';
import { translateText } from '../utils/translateText';

const formatCurrency = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const DEFAULT_TEXTS = {
  title: 'Painel do Investidor',
  historyTab: 'Histórico de Simulações',
  portfolioTab: 'Meu Portfólio',
  comingSoon: '(Em Breve)',
  savedSimulations: 'Suas Simulações Salvas',
  noSimulations: 'Você ainda não tem simulações salvas.',
  confirmDelete: 'Tem certeza que deseja excluir esta simulação?',
  edit: 'Editar',
  delete: 'Excluir'
};

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { simulations, isLoading, error, fetchSimulations, updateSimulation, deleteSimulation } = useSimulations();
  const [activeTab, setActiveTab] = useState<'historico' | 'investimentos'>('historico');
  const [editingSimulation, setEditingSimulation] = useState<Simulation | null>(null);
  const { language } = useLanguage();
  const [texts, setTexts] = useState(DEFAULT_TEXTS);

  const [sortBy, setSortBy] = useState<'date' | 'investimento'>('date');
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('favorite_simulations');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const translateAll = async () => {
      try {
        if (language === 'pt') {
          setTexts(DEFAULT_TEXTS);
          return;
        }
        const translatedTexts: Record<string, string> = {};
        for (const [key, value] of Object.entries(DEFAULT_TEXTS)) {
          translatedTexts[key] = await translateText(value, language);
        }
        setTexts(translatedTexts as typeof DEFAULT_TEXTS);
      } catch (error) {
        console.error('Translation error:', error);
        setTexts(DEFAULT_TEXTS);
      }
    };
    translateAll();
  }, [language]);

  useEffect(() => {
    if (user && activeTab === 'historico') {
      fetchSimulations();
    }
  }, [user, activeTab, fetchSimulations]);

  const handleDelete = async (simulationId: number) => {
    if (window.confirm(texts.confirmDelete)) {
      try {
        await deleteSimulation(simulationId);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdate = async (updatedInputs: Partial<Simulation>) => {
    if (!editingSimulation) return;
    try {
      await updateSimulation({ simulationId: editingSimulation.id, ...updatedInputs });
      setEditingSimulation(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = (id: number) => {
    const updated = favoriteIds.includes(id)
      ? favoriteIds.filter((favId) => favId !== id)
      : [...favoriteIds, id];
    setFavoriteIds(updated);
    localStorage.setItem('favorite_simulations', JSON.stringify(updated));
  };

  const sortedSimulations = [...simulations].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return b.invest_inicial - a.invest_inicial;
    }
  });

  if (!user) return null;

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>{texts.title}</h2>
      <nav className={styles.dashboardNav}>
        <button
          className={`${styles.navButton} ${activeTab === 'historico' ? styles.active : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          {texts.historyTab}
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'investimentos' ? styles.active : ''}`}
          onClick={() => setActiveTab('investimentos')}
        >
          {texts.portfolioTab} <span className={styles.wipTag}>{texts.comingSoon}</span>
        </button>
      </nav>
      <div className={styles.dashboardContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}
        {activeTab === 'historico' && (
          isLoading && !editingSimulation ? (
            <Loader />
          ) : (
            <div className={styles.historySection}>
              <h3>{texts.savedSimulations}</h3>
              <div className={styles.sortControls}>
                <label>Ordenar por:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'investimento')}>
                  <option value="date">Data</option>
                  <option value="investimento">Investimento Inicial</option>
                </select>
              </div>
              {sortedSimulations.length > 0 ? (
                <ul className={styles.simulationList}>
                  {sortedSimulations.map((sim) => (
                    <SimulationCard
                      key={sim.id}
                      simulation={sim}
                      onDelete={handleDelete}
                      onEdit={setEditingSimulation}
                      texts={texts}
                      isFavorite={favoriteIds.includes(sim.id)}
                      toggleFavorite={toggleFavorite}
                    />
                  ))}
                </ul>
              ) : (
                !isLoading && <p className={styles.emptyMessage}>{texts.noSimulations}</p>
              )}
            </div>
          )
        )}
        {activeTab === 'investimentos' && <PortfolioOverview />}
      </div>
      {editingSimulation && (
        <ResimulateModal
          simulation={editingSimulation}
          onSave={handleUpdate}
          onClose={() => setEditingSimulation(null)}
        />
      )}
    </div>
  );
};

const SimulationCard: React.FC<{
  simulation: Simulation;
  onDelete: (id: number) => void;
  onEdit: (simulation: Simulation) => void;
  texts: { edit: string; delete: string };
  isFavorite: boolean;
  toggleFavorite: (id: number) => void;
}> = ({ simulation, onDelete, onEdit, texts, isFavorite, toggleFavorite }) => (
  <li className={styles.simulationCard}>
    <div className={styles.simulationInfo}>
      <strong>{simulation.tipo === 'acao' ? `Ação: ${simulation.nome}` : `Renda Fixa: ${simulation.nome}`}</strong>
      <span>Data: {new Date(simulation.createdAt).toLocaleDateString('pt-BR')}</span>
      <span>Invest. Inicial: {formatCurrency(simulation.invest_inicial)}</span>
      <span>Invest. Mensal: {formatCurrency(simulation.invest_mensal)}</span>
      <span>Período: {simulation.meses} meses</span>
    </div>
    <div className={styles.cardActions}>
      <button onClick={() => toggleFavorite(simulation.id)} className={`${styles.actionButton} ${isFavorite ? styles.favorite : ''}`}>
        {isFavorite ? '★' : '☆'}
      </button>
      <button onClick={() => onEdit(simulation)} className={`${styles.actionButton} ${styles.editButton}`}>
        {texts.edit}
      </button>
      <button onClick={() => onDelete(simulation.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
        {texts.delete}
      </button>
    </div>
  </li>
);