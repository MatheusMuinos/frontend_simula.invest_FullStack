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

// Textos padrão em português
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

  useEffect(() => {
    const translateAll = async () => {
      try {
        // Não traduzir se já for português
        if (language === 'pt') {
          setTexts(DEFAULT_TEXTS);
          return;
        }

        // Criar objeto com as traduções
        const translatedTexts: Record<string, string> = {};
        
        // Traduzir cada texto individualmente
        for (const [key, value] of Object.entries(DEFAULT_TEXTS)) {
          translatedTexts[key] = await translateText(value, language);
        }

        setTexts(translatedTexts as typeof DEFAULT_TEXTS);
      } catch (error) {
        console.error('Translation error:', error);
        // Em caso de erro, manter os textos padrão
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

  if (!user) {
    return null;
  }

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
              {simulations.length > 0 ? (
                <ul className={styles.simulationList}>
                  {simulations.map((sim) => (
                    <SimulationCard
                      key={sim.id}
                      simulation={sim}
                      onDelete={handleDelete}
                      onEdit={setEditingSimulation}
                      texts={texts}
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
}> = ({ simulation, onDelete, onEdit, texts }) => (
  <li className={styles.simulationCard}>
    <div className={styles.simulationInfo}>
      <strong>{simulation.tipo === 'acao' ? `Ação: ${simulation.nome}` : `Renda Fixa: ${simulation.nome}`}</strong>
      <span>Data: {new Date(simulation.createdAt).toLocaleDateString('pt-BR')}</span>
      <span>Invest. Inicial: {formatCurrency(simulation.invest_inicial)}</span>
      <span>Invest. Mensal: {formatCurrency(simulation.invest_mensal)}</span>
      <span>Período: {simulation.meses} meses</span>
    </div>
    <div className={styles.cardActions}>
      <button onClick={() => onEdit(simulation)} className={`${styles.actionButton} ${styles.editButton}`}>
        {texts.edit}
      </button>
      <button onClick={() => onDelete(simulation.id)} className={`${styles.actionButton} ${styles.deleteButton}`}>
        {texts.delete}
      </button>
    </div>
  </li>
);
