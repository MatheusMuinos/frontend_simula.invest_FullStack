import { useState } from 'react';
import axios from 'axios';

export interface SimulationInput {
    nome: string;
    tipo: 'acao' | 'renda-fixa';
    invest_inicial: number;
    invest_mensal: number;
    meses: number;
    inflacao: number;
}

export interface SimulationResult {
    valorFuturoBruto: number;
    totalInvestido: number;
    retornoBruto: number;
    valorAjustadoPelaInflacao: number;
}

interface DadosCrescimentoAcao {
    avgMonthlyGrowth: number;
    success: boolean;
    error?: string;
}

const taxasRetornoRendaFixa: Record<string, number> = {
    cdb: 0.008,
    "tesouro-direto": 0.007,
    lci: 0.0075,
    lca: 0.0075,
    poupanca: 0.005,
};
const FALLBACK_ACAO_MONTHLY_GROWTH = 0.01;

const obterDadosCrescimentoAcao = async (symbol: string): Promise<DadosCrescimentoAcao> => {
    const API_KEY_TWELVE_DATA = import.meta.env.VITE_TWELVEDATA_API_KEY;
    if (!API_KEY_TWELVE_DATA) {
        return { avgMonthlyGrowth: FALLBACK_ACAO_MONTHLY_GROWTH, success: false, error: "API key not configured." };
    }
    try {
        const response = await axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol.trim().toUpperCase()}&interval=1month&outputsize=24&apikey=${API_KEY_TWELVE_DATA}`);
        const data = response.data;
        if (data?.values?.length > 1) {
            const closes: number[] = data.values.map((entry: { close: string }) => parseFloat(entry.close)).reverse();
            const monthlyGrowths = closes.slice(1).map((close, i) => (close - closes[i]) / closes[i]).filter(g => isFinite(g));
            if (monthlyGrowths.length === 0) {
                return { avgMonthlyGrowth: FALLBACK_ACAO_MONTHLY_GROWTH, success: false, error: `Not enough data for ${symbol}.` };
            }
            const averageMonthlyGrowth = monthlyGrowths.reduce((sum, g) => sum + g, 0) / monthlyGrowths.length;
            return { avgMonthlyGrowth: averageMonthlyGrowth, success: true };
        }
        return { avgMonthlyGrowth: FALLBACK_ACAO_MONTHLY_GROWTH, success: false, error: data?.message || `No time series data for ${symbol}.` };
    } catch (error: any) {
        return { avgMonthlyGrowth: FALLBACK_ACAO_MONTHLY_GROWTH, success: false, error: error.response?.data?.message || "Failed to fetch stock data." };
    }
};

export const useSimulationCalculator = () => {
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SimulationResult | null>(null);

    const calculate = async (inputs: SimulationInput): Promise<SimulationResult | null> => {
        setIsCalculating(true);
        setError(null);
        setResult(null);

        try {
            let taxaMensalEstimada: number;
            if (inputs.tipo === 'acao') {
                const dadosCrescimento = await obterDadosCrescimentoAcao(inputs.nome);
                taxaMensalEstimada = dadosCrescimento.avgMonthlyGrowth;
                if (!dadosCrescimento.success) setError(dadosCrescimento.error || `Using fallback rate for ${inputs.nome}.`);
            } else {
                taxaMensalEstimada = taxasRetornoRendaFixa[inputs.nome] || 0.005;
            }

            let valorAcumulado = inputs.invest_inicial;
            for (let i = 1; i <= inputs.meses; i++) {
                if (i > 1 || inputs.invest_inicial === 0) valorAcumulado += inputs.invest_mensal;
                valorAcumulado *= (1 + taxaMensalEstimada);
            }

            const totalInvestido = inputs.invest_inicial + (inputs.invest_mensal * inputs.meses);
            const newResult = {
                valorFuturoBruto: valorAcumulado,
                totalInvestido: totalInvestido,
                retornoBruto: valorAcumulado - totalInvestido,
                valorAjustadoPelaInflacao: valorAcumulado / Math.pow(1 + inputs.inflacao, inputs.meses / 12),
            };
            setResult(newResult);
            return newResult;
        } catch (err: any) {
            setError("An error occurred during calculation.");
            return null;
        } finally {
            setIsCalculating(false);
        }
    };

    return { isCalculating, error, result, calculate };
};