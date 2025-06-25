import React, { useState } from 'react';
import { Simulation } from '../hooks/useSimulations';
import Grafico from './Grafico';
import styles from './ComparadorModal.module.css';

interface ComparadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulations: Simulation[];
}

interface SimulationResult {
  simulation: Simulation;
  valorFuturoBruto: number;
  totalInvestido: number;
  retornoBruto: number;
  valorAjustadoPelaInflacao: number;
  dadosGrafico: { labels: string[]; values: number[] };
}

const taxasRetornoRendaFixa: Record<string, number> = {
  cdb: 0.008,
  "tesouro-direto": 0.007,
  lci: 0.0075,
  lca: 0.0075,
  poupanca: 0.005,
};

const FALLBACK_ACAO_MONTHLY_GROWTH = 0.01;

export const ComparadorModal: React.FC<ComparadorModalProps> = ({ isOpen, onClose, simulations }) => {
  const [selectedSimulations, setSelectedSimulations] = useState<number[]>([]);
  const [comparisonResults, setComparisonResults] = useState<SimulationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateSimulationResults = (sim: Simulation): SimulationResult => {
    const taxaMensalEstimada = sim.tipo === 'acao' ? FALLBACK_ACAO_MONTHLY_GROWTH : (taxasRetornoRendaFixa[sim.nome] || 0.005);
    
    let valorAcumulado = sim.invest_inicial;
    let totalInvestidoCalculado = sim.invest_inicial;
    const labelsParaGrafico: string[] = ["Mês 0"];
    const valoresParaGrafico: number[] = [parseFloat(valorAcumulado.toFixed(2))];

    for (let i = 1; i <= sim.meses; i++) {
      if (i > 1 || sim.invest_inicial === 0) {
        valorAcumulado += sim.invest_mensal;
        totalInvestidoCalculado += sim.invest_mensal;
      }
      valorAcumulado *= (1 + taxaMensalEstimada);
      labelsParaGrafico.push(`Mês ${i}`);
      valoresParaGrafico.push(parseFloat(valorAcumulado.toFixed(2)));
    }

    const valorFuturoBruto = valorAcumulado;
    const retornoBruto = valorFuturoBruto - totalInvestidoCalculado;
    const valorAjustadoPelaInflacao = valorFuturoBruto / Math.pow(1 + sim.inflacao, sim.meses / 12);

    return {
      simulation: sim,
      valorFuturoBruto,
      totalInvestido: totalInvestidoCalculado,
      retornoBruto,
      valorAjustadoPelaInflacao,
      dadosGrafico: { labels: labelsParaGrafico, values: valoresParaGrafico }
    };
  };

  const handleSimulationSelect = (simId: number) => {
    setSelectedSimulations(prev => 
      prev.includes(simId) 
        ? prev.filter(id => id !== simId)
        : prev.length < 3 ? [...prev, simId] : prev
    );
  };

  const handleCompare = () => {
    setIsCalculating(true);
    const selectedSims = simulations.filter(sim => selectedSimulations.includes(sim.id));
    const results = selectedSims.map(calculateSimulationResults);
    setComparisonResults(results);
    setIsCalculating(false);
  };

  const resetComparison = () => {
    setSelectedSimulations([]);
    setComparisonResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Comparador de Simulações</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          {comparisonResults.length === 0 ? (
            <>
              <h3>Selecione até 3 simulações para comparar:</h3>
              <div className={styles.simulationsList}>
                {simulations.map(sim => (
                  <div key={sim.id} className={styles.simulationItem}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={selectedSimulations.includes(sim.id)}
                        onChange={() => handleSimulationSelect(sim.id)}
                        disabled={!selectedSimulations.includes(sim.id) && selectedSimulations.length >= 3}
                      />
                      <span className={styles.simulationInfo}>
                        <strong>{sim.tipo === 'acao' ? `Ação: ${sim.nome}` : `Renda Fixa: ${sim.nome.toUpperCase()}`}</strong>
                        <span>Inicial: {formatarMoeda(sim.invest_inicial)} | Mensal: {formatarMoeda(sim.invest_mensal)} | {sim.meses} meses</span>
                      </span>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className={styles.actionButtons}>
                <button 
                  onClick={handleCompare} 
                  disabled={selectedSimulations.length < 2 || isCalculating}
                  className={styles.compareButton}
                >
                  {isCalculating ? 'Calculando...' : `Comparar ${selectedSimulations.length} Simulações`}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className={styles.comparisonHeader}>
                <h3>Resultados da Comparação</h3>
                <button onClick={resetComparison} className={styles.resetButton}>
                  Nova Comparação
                </button>
              </div>
              
              <div className={styles.comparisonResults}>
                <div className={styles.resultCards}>
                  {comparisonResults.map((result) => (
                    <div key={result.simulation.id} className={styles.resultCard}>
                      <h4>{result.simulation.tipo === 'acao' ? `Ação: ${result.simulation.nome}` : `${result.simulation.nome.toUpperCase()}`}</h4>
                      <div className={styles.metrics}>
                        <div className={styles.metric}>
                          <span className={styles.label}>Total Investido:</span>
                          <span className={styles.value}>{formatarMoeda(result.totalInvestido)}</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.label}>Valor Futuro:</span>
                          <span className={styles.value}>{formatarMoeda(result.valorFuturoBruto)}</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.label}>Retorno:</span>
                          <span className={styles.value}>{formatarMoeda(result.retornoBruto)}</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.label}>Rentabilidade:</span>
                          <span className={styles.value}>
                            {((result.retornoBruto / result.totalInvestido) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.chartComparison}>
                  <h4>Evolução Comparativa</h4>
                  <div className={styles.chartsContainer}>
                    {comparisonResults.map((result, index) => (
                      <div key={result.simulation.id} className={styles.chartWrapper}>
                        <h5>{result.simulation.nome}</h5>
                        <Grafico 
                          dados={result.dadosGrafico} 
                          corLinha={['#4bc0c0', '#f77b72', '#ffc658'][index]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
