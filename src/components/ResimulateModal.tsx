import React, { useState } from 'react';
import { useSimulationCalculator, SimulationInput } from '../hooks/useSimulationCalculator';
import { Simulation } from '../hooks/useSimulations';
import styles from './Dashboard.module.css';
import { Loader } from './Loader';

interface ResimulateModalProps {
    simulation: Simulation;
    onSave: (data: Partial<Simulation>) => void;
    onClose: () => void;
}

const taxasRetornoRendaFixa: Record<string, number> = {
    cdb: 0.008,
    "tesouro-direto": 0.007,
    lci: 0.0075,
    lca: 0.0075,
    poupanca: 0.005,
};

const formatCurrency = (value: number): string => 
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const ResimulateModal: React.FC<ResimulateModalProps> = ({ simulation, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        tipo: simulation.tipo,
        nome: simulation.nome,
        invest_inicial: simulation.invest_inicial,
        invest_mensal: simulation.invest_mensal,
        meses: simulation.meses,
        inflacao: (simulation.inflacao * 100).toFixed(1),
    });
    
    const { isCalculating, error, result, calculate } = useSimulationCalculator();
    const [hasCalculated, setHasCalculated] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            
            if (name === 'tipo') {
                newState.tipo = value as 'acao' | 'renda-fixa';
                newState.nome = newState.tipo === 'acao' ? 'AAPL' : 'cdb';
            }

            return newState;
        });
        
        setHasCalculated(false);
    };

    const handleRecalculate = async () => {
        const inputsToCalculate: SimulationInput = {
            tipo: formData.tipo,
            nome: formData.nome,
            invest_inicial: Number(formData.invest_inicial),
            invest_mensal: Number(formData.invest_mensal),
            meses: Number(formData.meses),
            inflacao: Number(String(formData.inflacao).replace(',', '.')) / 100,
        };

        const calculationResult = await calculate(inputsToCalculate);
        if (calculationResult) {
            setHasCalculated(true);
        }
    };

    const handleSave = () => {
        const payloadToSave = {
            ...formData,
            invest_inicial: Number(formData.invest_inicial),
            invest_mensal: Number(formData.invest_mensal),
            meses: Number(formData.meses),
            inflacao: Number(String(formData.inflacao).replace(',', '.')) / 100,
        };
        onSave(payloadToSave);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{maxWidth: '700px'}}>
                <h3>Re-simular e Salvar</h3>
                <div className={styles.resimulateGrid}>
                    <div className={styles.formSection}>
                        <div className={styles.formGroup}>
                            <label htmlFor="tipo">Tipo de Investimento</label>
                            <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} className={styles.formSelect}>
                                <option value="acao">Ações</option>
                                <option value="renda-fixa">Renda Fixa</option>
                            </select>
                        </div>
                        
                        {formData.tipo === 'acao' ? (
                            <div className={styles.formGroup}>
                                <label htmlFor="nome">Símbolo da Ação (Ex: AAPL)</label>
                                <input type="text" id="nome" name="nome" value={formData.nome} onChange={handleChange} />
                            </div>
                        ) : (
                            <div className={styles.formGroup}>
                                <label htmlFor="nome">Opção de Renda Fixa</label>
                                <select id="nome" name="nome" value={formData.nome} onChange={handleChange} className={styles.formSelect}>
                                    {Object.keys(taxasRetornoRendaFixa).map((key) => (
                                        <option key={key} value={key}>{key.toUpperCase().replace(/-/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className={styles.formGroup}>
                            <label htmlFor="invest_inicial">Investimento Inicial (R$)</label>
                            <input type="number" id="invest_inicial" name="invest_inicial" value={formData.invest_inicial} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="invest_mensal">Contribuição Mensal (R$)</label>
                            <input type="number" id="invest_mensal" name="invest_mensal" value={formData.invest_mensal} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="meses">Período (Meses)</label>
                            <input type="number" id="meses" name="meses" value={formData.meses} onChange={handleChange} />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="inflacao">Inflação Anual Estimada (%)</label>
                            <input type="text" id="inflacao" name="inflacao" value={formData.inflacao} onChange={handleChange} placeholder="Ex: 5,0"/>
                        </div>
                        
                        <button type="button" onClick={handleRecalculate} disabled={isCalculating} className={styles.recalculateButton}>
                            {isCalculating ? <Loader /> : 'Recalcular Projeção'}
                        </button>
                    </div>

                    <div className={styles.resultsSection}>
                        <h4>Nova Projeção</h4>
                        {error && <div className={styles.errorMessage}>{error}</div>}
                        {result ? (
                            <div className={styles.resultCards}>
                                <div><strong>Total Investido:</strong> {formatCurrency(result.totalInvestido)}</div>
                                <div><strong>Retornos Brutos:</strong> {formatCurrency(result.retornoBruto)}</div>
                                <div><strong>Valor Futuro:</strong> {formatCurrency(result.valorFuturoBruto)}</div>
                                <div style={{marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #eee'}}>
                                    <strong>Valor Ajustado (Inflação):</strong> {formatCurrency(result.valorAjustadoPelaInflacao)}
                                </div>
                            </div>
                        ) : (
                           <p>Altere os valores e clique em "Recalcular" para ver a nova projeção.</p>
                        )}
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button type="button" onClick={onClose} className={styles.cancelButton}>Cancelar</button>
                    <button type="button" onClick={handleSave} className={styles.saveButton} disabled={!hasCalculated || isCalculating}>
                        Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    );
};