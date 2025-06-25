import React, { useState, useEffect } from 'react';
import Grafico from './Grafico';
import styles from './CenarioCalculator.module.css';

interface CenarioCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
  baseScenario: {
    inicial: number;
    mensal: number;
    meses: number;
    taxaMensal: number;
    inflacao: number;
  };
}

interface ScenarioResult {
  valorFuturoBruto: number;
  totalInvestido: number;
  retornoBruto: number;
  valorAjustadoPelaInflacao: number;
  dadosGrafico: { labels: string[]; values: number[] };
}

export const CenarioCalculator: React.FC<CenarioCalculatorProps> = ({ isOpen, onClose, baseScenario }) => {
  const [modificadores, setModificadores] = useState({
    inicial: 0,    // Porcentagem de mudança
    mensal: 0,     // Porcentagem de mudança  
    meses: 0       // Meses adicionais/reduzidos
  });

  const [baseResult, setBaseResult] = useState<ScenarioResult | null>(null);
  const [modifiedResult, setModifiedResult] = useState<ScenarioResult | null>(null);

  const formatarMoeda = (valor: number): string => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const calculateScenario = (inicial: number, mensal: number, meses: number, taxaMensal: number, inflacao: number): ScenarioResult => {
    let valorAcumulado = inicial;
    let totalInvestidoCalculado = inicial;
    const labelsParaGrafico: string[] = ["Mês 0"];
    const valoresParaGrafico: number[] = [parseFloat(valorAcumulado.toFixed(2))];

    for (let i = 1; i <= meses; i++) {
      if (i > 1 || inicial === 0) {
        valorAcumulado += mensal;
        totalInvestidoCalculado += mensal;
      }
      valorAcumulado *= (1 + taxaMensal);
      labelsParaGrafico.push(`Mês ${i}`);
      valoresParaGrafico.push(parseFloat(valorAcumulado.toFixed(2)));
    }

    const valorFuturoBruto = valorAcumulado;
    const retornoBruto = valorFuturoBruto - totalInvestidoCalculado;
    const valorAjustadoPelaInflacao = valorFuturoBruto / Math.pow(1 + inflacao, meses / 12);

    return {
      valorFuturoBruto,
      totalInvestido: totalInvestidoCalculado,
      retornoBruto,
      valorAjustadoPelaInflacao,
      dadosGrafico: { labels: labelsParaGrafico, values: valoresParaGrafico }
    };
  };

  useEffect(() => {
    if (isOpen && baseScenario) {
      // Calcular cenário base
      const base = calculateScenario(
        baseScenario.inicial,
        baseScenario.mensal,
        baseScenario.meses,
        baseScenario.taxaMensal,
        baseScenario.inflacao
      );
      setBaseResult(base);

      // Calcular cenário modificado
      const novoInicial = baseScenario.inicial * (1 + modificadores.inicial / 100);
      const novoMensal = baseScenario.mensal * (1 + modificadores.mensal / 100);
      const novoMeses = baseScenario.meses + modificadores.meses;

      if (novoMeses > 0) {
        const modified = calculateScenario(
          novoInicial,
          novoMensal,
          novoMeses,
          baseScenario.taxaMensal,
          baseScenario.inflacao
        );
        setModifiedResult(modified);
      }
    }
  }, [isOpen, baseScenario, modificadores]);

  const handleModificadorChange = (tipo: keyof typeof modificadores, valor: number) => {
    setModificadores(prev => ({ ...prev, [tipo]: valor }));
  };

  const resetModificadores = () => {
    setModificadores({ inicial: 0, mensal: 0, meses: 0 });
  };

  const getDifference = (base: number, modified: number) => {
    const diff = modified - base;
    const percentDiff = ((diff / base) * 100);
    return {
      absolute: diff,
      percent: percentDiff,
      isPositive: diff > 0
    };
  };

  if (!isOpen || !baseResult) return null;

  const novoInicial = baseScenario.inicial * (1 + modificadores.inicial / 100);
  const novoMensal = baseScenario.mensal * (1 + modificadores.mensal / 100);
  const novoMeses = baseScenario.meses + modificadores.meses;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Calculadora de Cenários "E Se?"</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.scenarioControls}>
            <h3>Ajuste os parâmetros para ver o impacto:</h3>
            
            <div className={styles.controlsGrid}>
              <div className={styles.controlGroup}>
                <label>Investimento Inicial:</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={modificadores.inicial}
                    onChange={(e) => handleModificadorChange('inicial', Number(e.target.value))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>{formatarMoeda(baseScenario.inicial)} → {formatarMoeda(novoInicial)}</span>
                    <span className={modificadores.inicial >= 0 ? styles.positive : styles.negative}>
                      {modificadores.inicial >= 0 ? '+' : ''}{modificadores.inicial}%
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label>Contribuição Mensal:</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={modificadores.mensal}
                    onChange={(e) => handleModificadorChange('mensal', Number(e.target.value))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>{formatarMoeda(baseScenario.mensal)} → {formatarMoeda(novoMensal)}</span>
                    <span className={modificadores.mensal >= 0 ? styles.positive : styles.negative}>
                      {modificadores.mensal >= 0 ? '+' : ''}{modificadores.mensal}%
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.controlGroup}>
                <label>Período:</label>
                <div className={styles.sliderContainer}>
                  <input
                    type="range"
                    min={-baseScenario.meses + 1}
                    max="60"
                    value={modificadores.meses}
                    onChange={(e) => handleModificadorChange('meses', Number(e.target.value))}
                    className={styles.slider}
                  />
                  <div className={styles.sliderLabels}>
                    <span>{baseScenario.meses} meses → {novoMeses} meses</span>
                    <span className={modificadores.meses >= 0 ? styles.positive : styles.negative}>
                      {modificadores.meses >= 0 ? '+' : ''}{modificadores.meses} meses
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={resetModificadores} className={styles.resetButton}>
              Resetar Ajustes
            </button>
          </div>

          {modifiedResult && (
            <div className={styles.comparisonResults}>
              <h3>Comparação de Resultados:</h3>
              
              <div className={styles.resultsGrid}>
                <div className={styles.resultColumn}>
                  <h4>Cenário Original</h4>
                  <div className={styles.resultCard}>
                    <div className={styles.metric}>
                      <span>Total Investido:</span>
                      <span>{formatarMoeda(baseResult.totalInvestido)}</span>
                    </div>
                    <div className={styles.metric}>
                      <span>Valor Futuro:</span>
                      <span>{formatarMoeda(baseResult.valorFuturoBruto)}</span>
                    </div>
                    <div className={styles.metric}>
                      <span>Retorno:</span>
                      <span>{formatarMoeda(baseResult.retornoBruto)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.resultColumn}>
                  <h4>Cenário Modificado</h4>
                  <div className={styles.resultCard}>
                    <div className={styles.metric}>
                      <span>Total Investido:</span>
                      <span>{formatarMoeda(modifiedResult.totalInvestido)}</span>
                    </div>
                    <div className={styles.metric}>
                      <span>Valor Futuro:</span>
                      <span>{formatarMoeda(modifiedResult.valorFuturoBruto)}</span>
                    </div>
                    <div className={styles.metric}>
                      <span>Retorno:</span>
                      <span>{formatarMoeda(modifiedResult.retornoBruto)}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.resultColumn}>
                  <h4>Diferenças</h4>
                  <div className={styles.resultCard}>
                    {(() => {
                      const diffInvestido = getDifference(baseResult.totalInvestido, modifiedResult.totalInvestido);
                      const diffFuturo = getDifference(baseResult.valorFuturoBruto, modifiedResult.valorFuturoBruto);
                      const diffRetorno = getDifference(baseResult.retornoBruto, modifiedResult.retornoBruto);
                      
                      return (
                        <>
                          <div className={styles.metric}>
                            <span>Total Investido:</span>
                            <span className={diffInvestido.isPositive ? styles.positive : styles.negative}>
                              {diffInvestido.isPositive ? '+' : ''}{formatarMoeda(diffInvestido.absolute)}
                            </span>
                          </div>
                          <div className={styles.metric}>
                            <span>Valor Futuro:</span>
                            <span className={diffFuturo.isPositive ? styles.positive : styles.negative}>
                              {diffFuturo.isPositive ? '+' : ''}{formatarMoeda(diffFuturo.absolute)}
                            </span>
                          </div>
                          <div className={styles.metric}>
                            <span>Retorno:</span>
                            <span className={diffRetorno.isPositive ? styles.positive : styles.negative}>
                              {diffRetorno.isPositive ? '+' : ''}{formatarMoeda(diffRetorno.absolute)} ({diffRetorno.percent.toFixed(1)}%)
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className={styles.chartComparison}>
                <h4>Evolução Comparativa</h4>
                <div className={styles.chartsContainer}>
                  <div className={styles.chartWrapper}>
                    <h5>Cenário Original</h5>
                    <Grafico dados={baseResult.dadosGrafico} corLinha="#4bc0c0" />
                  </div>
                  <div className={styles.chartWrapper}>
                    <h5>Cenário Modificado</h5>
                    <Grafico dados={modifiedResult.dadosGrafico} corLinha="#f77b72" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
