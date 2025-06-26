import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

type DadosAcao = {
  simbolo: string;
  precoAtual: number;
  ultimaAtualizacao: number;
};

type TrendAnalysisResult = {
  tendencia: 'Alta' | 'Baixa' | 'Estável';
  slope: number;
};

const analysisDetails = {
    Alta: {
        icon: '📈',
        title: 'Tendência de Alta',
        justification: 'A análise dos dados históricos mensais indica uma trajetória de crescimento consistente.',
        bgColor: '#dcfce7',
        textColor: '#166534',
    },
    Baixa: {
        icon: '📉',
        title: 'Tendência de Baixa',
        justification: 'A análise dos dados históricos mensais aponta para uma trajetória de desvalorização.',
        bgColor: '#fee2e2',
        textColor: '#991b1b',
    },
    Estável: {
        icon: '↔️',
        title: 'Tendência Estável',
        justification: 'Os dados mensais não mostram uma tendência forte de alta nem de baixa.',
        bgColor: '#f3f4f6',
        textColor: '#374151',
    }
};


const CHAVE_API_FINNHUB = import.meta.env.VITE_FINNHUB_API_KEY;
const API_KEY_TWELVE_DATA = import.meta.env.VITE_TWELVEDATA_API_KEY;

interface PrecoAcaoProps {
  onSimboloChange: (simbolo: string, precoAtual: number | null) => void;
  initialSimbolo?: string;
}

const PrecoAcao: React.FC<PrecoAcaoProps> = ({
  onSimboloChange,
  initialSimbolo = "AAPL"
}) => {
  const [currentSimbolo, setCurrentSimbolo] = useState(initialSimbolo);
  const [dadosAcao, setDadosAcao] = useState<DadosAcao | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputSimbolo, setInputSimbolo] = useState(initialSimbolo);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TrendAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const buscarPrecoAcao = useCallback(async (symbolToFetch: string) => {
    const trimmedSymbol = symbolToFetch.trim().toUpperCase();
    
    setAnalysisResult(null);
    setAnalysisError(null);
    
    if (!trimmedSymbol || trimmedSymbol.length > 10) {
      onSimboloChange(trimmedSymbol, null);
      setDadosAcao(null);
      return;
    }

    setIsLoading(true);
    try {
      const resposta = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${trimmedSymbol}&token=${CHAVE_API_FINNHUB}`
      );

      if (resposta.data.c && resposta.data.c !== 0) {
        const newDadosAcao = {
          simbolo: trimmedSymbol,
          precoAtual: resposta.data.c,
          ultimaAtualizacao: resposta.data.t * 1000,
        };
        setDadosAcao(newDadosAcao);
        onSimboloChange(newDadosAcao.simbolo, newDadosAcao.precoAtual);
      } else {
        setDadosAcao(null);
        onSimboloChange(trimmedSymbol, null);
        console.warn(`Nenhum dado de preço encontrado para ${trimmedSymbol}`);
      }
    } catch (erro) {
      console.error(`Erro ao buscar dados da ação (${trimmedSymbol}):`, erro);
      setDadosAcao(null);
      onSimboloChange(trimmedSymbol, null);
    } finally {
      setIsLoading(false);
    }
  }, [onSimboloChange]);

  const analisarTendencia = async (symbol: string) => {
    if (!API_KEY_TWELVE_DATA) {
        setAnalysisError("Chave da API TwelveData não configurada.");
        return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError(null);

    try {
        const response = await axios.get(`https://api.twelvedata.com/time_series?symbol=${symbol.trim().toUpperCase()}&interval=1month&outputsize=24&apikey=${API_KEY_TWELVE_DATA}`);
        const data = response.data;

        if (data?.values?.length > 3) {
            const closes: number[] = data.values.map((entry: { close: string }) => parseFloat(entry.close)).reverse();
            
            let sum_x = 0, sum_y = 0, sum_xy = 0, sum_xx = 0;
            const n = closes.length;

            for (let i = 0; i < n; i++) {
                sum_x += i;
                sum_y += closes[i];
                sum_xy += i * closes[i];
                sum_xx += i * i;
            }

            const slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x);
            const avgPrice = sum_y / n;
            const normalizedSlope = slope / avgPrice;

            let tendencia: 'Alta' | 'Baixa' | 'Estável';
            if (normalizedSlope > 0.015) {
                tendencia = 'Alta';
            } else if (normalizedSlope < -0.015) {
                tendencia = 'Baixa';
            } else {
                tendencia = 'Estável';
            }
            
            setAnalysisResult({ tendencia, slope });

        } else {
            setAnalysisError("Dados históricos insuficientes para análise.");
        }
    } catch (error: any) {
        console.error(`Erro na análise de tendência para ${symbol}:`, error.response?.data || error.message);
        setAnalysisError(error.response?.data?.message || "Falha ao buscar dados históricos.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (currentSimbolo) {
        buscarPrecoAcao(currentSimbolo);
    }
  }, [currentSimbolo, buscarPrecoAcao]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputSimbolo.trim().toUpperCase() !== currentSimbolo) {
          setCurrentSimbolo(inputSimbolo.trim().toUpperCase());
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [inputSimbolo, currentSimbolo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputSimbolo(e.target.value);
  };
  
  const handleButtonClick = () => {
    const symbolToSearch = inputSimbolo.trim().toUpperCase();
    setCurrentSimbolo(symbolToSearch);
  }

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", gap: "8px", alignItems: 'center' }}>
        <input
          type="text"
          value={inputSimbolo}
          onChange={handleInputChange}
          placeholder="Símbolo (ex: AAPL)"
          style={{ padding: "8px", flex: 1, borderRadius: "4px", border: "1px solid #ccc" }}
          aria-label="Símbolo da Ação"
        />
        <button
          onClick={handleButtonClick}
          disabled={isLoading || inputSimbolo.trim().length === 0 || inputSimbolo.trim().length > 10}
          style={{
            padding: "8px 12px",
            backgroundColor: isLoading ? "#ccc" : "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isLoading ? "default" : "pointer",
          }}
        >
          {isLoading ? "Busc..." : "Buscar"}
        </button>
      </div>

      {!isLoading && dadosAcao && (
        <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#f9fafb", borderRadius: "4px" }}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px"}}>
            <div>
              <strong>{dadosAcao.simbolo}</strong>: R$
              {dadosAcao.precoAtual.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              <div style={{ fontSize: "0.8em", color: "#6b7280" }}>
                Última atualização:{" "}
                {new Date(dadosAcao.ultimaAtualizacao).toLocaleString("pt-BR")}
              </div>
            </div>

            <button
                onClick={() => analisarTendencia(dadosAcao.simbolo)}
                disabled={isAnalyzing}
                style={{
                    padding: "6px 10px",
                    backgroundColor: isAnalyzing ? "#ccc" : "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: isAnalyzing ? "default" : "pointer",
                    fontSize: "0.9em"
                }}
            >
                {isAnalyzing ? "Analisando..." : "Analisar Tendência"}
            </button>
          </div>
          {analysisResult && (
             (() => {
                const details = analysisDetails[analysisResult.tendencia];
                return (
                    <div style={{ 
                        marginTop: '12px', 
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: details.bgColor,
                        borderLeft: `5px solid ${details.textColor}`,
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: details.textColor, fontSize: '1.1em', fontWeight: 'bold' }}>
                            <span>{details.icon}</span>
                            <span>{details.title}</span>
                        </div>
                        <p style={{ margin: '8px 0 0', color: details.textColor, fontSize: '0.9em' }}>
                            {details.justification}
                        </p>
                        <p style={{ margin: '10px 0 0', color: '#6b7280', fontSize: '0.75em', fontStyle: 'italic', textAlign: 'center' }}>
                           *Esta é uma análise técnica baseada em dados passados e não representa uma recomendação de investimento.
                        </p>
                    </div>
                );
            })()
          )}
          {analysisError && (
              <div style={{ marginTop: '10px', color: '#ef4444', fontSize: '0.9em', textAlign: 'center', padding: '8px', backgroundColor: '#fee2e2', borderRadius: '4px' }}>
                  <strong>Erro na Análise:</strong> {analysisError}
              </div>
          )}

        </div>
      )}
      {!isLoading && !dadosAcao && inputSimbolo.trim() && currentSimbolo === inputSimbolo.trim().toUpperCase() && (
         <div style={{ marginTop: "10px", fontSize: "0.9em", color: "#ef4444" }}>
           Nenhum dado encontrado para {inputSimbolo.trim().toUpperCase()} ou símbolo inválido.
         </div>
      )}
    </div>
  );
};

export default PrecoAcao;