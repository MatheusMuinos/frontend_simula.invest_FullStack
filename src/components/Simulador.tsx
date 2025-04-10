import { useState } from "react";
import axios from "axios";
import { Scroll } from "./Scroll";
import Grafico from "./Grafico";
import PrecoAcao from "./PrecoAcao";
import TabelaAcoes from "./TabelaAcoes";

type Valores = {
  inicial: string;
  mensal: string;
  meses: number;
  inflacao: string;
  tipoInvestimento: string;
  tipoRendaFixa: string;
};

type Resultados = {
  valorFuturo: number;
  totalInvestido: number;
  retorno: number;
  ajusteInflacao: number;
};

type DadosAcao = {
  avgMonthlyGrowth: number;
  success: boolean;
};

const taxasRetorno = {
  acoes: 0.01,
  "renda-fixa": {
    cdb: 0.005,
    "tesouro-direto": 0.0035,
    lci: 0.004,
    lca: 0.004,
    lc: 0.0045,
    debentures: 0.006,
    cri: 0.005,
    cra: 0.005,
    "fundos-renda-fixa": 0.0045,
    poupanca: 0.003,
  },
};

export const Simulador = () => {
  const [valores, setValores] = useState<Valores>({
    inicial: "1000",
    mensal: "100",
    meses: 12,
    inflacao: "5",
    tipoInvestimento: "acoes",
    tipoRendaFixa: "cdb",
  });

  const [resultados, setResultados] = useState<Resultados>({
    valorFuturo: 0,
    totalInvestido: 0,
    retorno: 0,
    ajusteInflacao: 0,
  });

  const [dadosGrafico, setDadosGrafico] = useState({
    labels: [] as string[],
    values: [] as number[],
  });

  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");

  const formatarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (["inicial", "mensal", "inflacao"].includes(id)) {
      const cleanedValue = value.replace(/[^\d,]/g, "");
      const [inteiro, decimal] = cleanedValue.split(",");
      const formattedInt = inteiro
        ? parseInt(inteiro.replace(/\D/g, ""), 10).toLocaleString("pt-BR")
        : "";
      const formattedValue =
        decimal !== undefined ? `${formattedInt},${decimal}` : formattedInt;
      setValores((prev) => ({ ...prev, [id]: formattedValue }));
    } else {
      setValores((prev) => ({ ...prev, [id]: value }));
    }
  };

  const formatarSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setValores((prev) => ({ ...prev, [id]: value }));
  };

  const stringParaFloat = (valor: string) => parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

  const obterDadosAcao = async (): Promise<DadosAcao> => {
    const symbol = "AAPL";
    const to = Math.floor(Date.now() / 1000);
    const from = to - 60 * 60 * 24 * 365 * 2;

    const API_KEY = "cvrrec9r01qnpem98r4gcvrrec9r01qnpem98r50";

    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=M&from=${from}&to=${to}&token=${API_KEY}`
      );

      if (response.data.c?.length > 1) {
        const closes = response.data.c;
        const totalGrowth = closes.slice(1).reduce((sum: number, close: number, i: number) =>
          sum + (close - closes[i]) / closes[i], 0);
        return { avgMonthlyGrowth: totalGrowth / (closes.length - 1), success: true };
      }

      throw new Error("No monthly data available");
    } catch (error) {
      console.error("API error:", error);
      return { avgMonthlyGrowth: taxasRetorno.acoes, success: false };
    }
  };

  const calcularInvestimento = async () => {
    setCarregando(true);
    setErroApi("");

    try {
      const { inicial, mensal, meses, inflacao, tipoInvestimento, tipoRendaFixa } = valores;
      const investimentoInicial = stringParaFloat(inicial);
      const contribuicaoMensal = stringParaFloat(mensal);
      const inflacaoDecimal = stringParaFloat(inflacao) / 100;

      const taxaMensal = tipoInvestimento === "acoes"
        ? (await obterDadosAcao()).avgMonthlyGrowth
        : taxasRetorno["renda-fixa"][tipoRendaFixa as keyof typeof taxasRetorno["renda-fixa"]];

      let valorAtual = investimentoInicial;
      let totalInvestido = investimentoInicial;
      const labels: string[] = [];
      const values: number[] = [valorAtual];

      for (let i = 0; i < meses; i++) {
        valorAtual *= 1 + taxaMensal;
        if (i > 0) {
          valorAtual += contribuicaoMensal * (1 + taxaMensal);
          totalInvestido += contribuicaoMensal;
        }
        labels.push(`Mês ${i + 1}`);
        values.push(parseFloat(valorAtual.toFixed(2)));
      }

      setResultados({
        valorFuturo: valorAtual,
        totalInvestido,
        retorno: valorAtual - totalInvestido,
        ajusteInflacao: valorAtual / Math.pow(1 + inflacaoDecimal, meses),
      });

      setDadosGrafico({ labels, values });
    } catch (error) {
      console.error("Erro no cálculo:", error);
      setErroApi("Erro ao calcular. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <section id="simulador" className="simulador">
      <h2 className="titulo-simulador">Simulador de Crescimento de Investimentos</h2>

      {erroApi && <div className="mensagem-erro" style={{ color: "red", textAlign: "center", margin: "1rem 0" }}>{erroApi}</div>}

      <div className="formulario-simulador">
        <div className="grupo-formulario">
          <label htmlFor="inicial">Investimento Inicial (R$)</label>
          <input type="text" id="inicial" value={valores.inicial} inputMode="numeric" onChange={formatarInput} />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="mensal">Contribuição Mensal (R$)</label>
          <input type="text" id="mensal" value={valores.mensal} inputMode="numeric" onChange={formatarInput} />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="meses">Período de Investimento (Meses)</label>
          <input type="number" id="meses" value={valores.meses} min="1" max="1200" onChange={formatarInput} />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="inflacao">Taxa de Inflação Esperada (%)</label>
          <input type="text" id="inflacao" value={valores.inflacao} inputMode="numeric" onChange={formatarInput} />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="tipoInvestimento">Tipo de Investimento</label>
          <select id="tipoInvestimento" value={valores.tipoInvestimento} onChange={formatarSelect}>
            <option value="acoes">Ações</option>
            <option value="renda-fixa">Renda Fixa</option>
          </select>
        </div>

        {valores.tipoInvestimento === "acoes" && (
          <div className="grupo-formulario">
            <label>Dados em Tempo Real (Finnhub)</label>
            <PrecoAcao />
          </div>
        )}

        {valores.tipoInvestimento === "renda-fixa" && (
          <div className="grupo-formulario">
            <label htmlFor="tipoRendaFixa">Tipo de Renda Fixa</label>
            <select id="tipoRendaFixa" value={valores.tipoRendaFixa} onChange={formatarSelect}>
              {Object.entries(taxasRetorno["renda-fixa"]).map(([key]) => (
                <option key={key} value={key}>{key.toUpperCase()}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Scroll
        href="#simulador"
        className={`botao botao-primario ${carregando ? "botao-desabilitado" : ""}`}
        style={{ display: "block", width: "200px", margin: "0 auto 2rem", textAlign: "center" }}
        onClick={calcularInvestimento}
      >
        {carregando ? "Calculando..." : "Calcular Resultados"}
      </Scroll>

      <div className="resultados">
        {Object.entries(resultados).map(([key, value]) => (
          <div key={key} className="cartao-resultado">
            <div className="valor-resultado">{formatarMoeda(value)}</div>
            <div className="rotulo-resultado">
              {key === "valorFuturo" ? "Valor Futuro" :
               key === "totalInvestido" ? "Total Investido" :
               key === "retorno" ? "Retornos do Investimento" : "Valor Ajustado pela Inflação"}
            </div>
          </div>
        ))}
      </div>

      <div className="grafico">
        {dadosGrafico.values.length > 0 ? (
          <Grafico dados={dadosGrafico} />
        ) : (
          <div className="placeholder-grafico">
            [Gráfico de Crescimento do Investimento]
          </div>
        )}
      </div>

      {/* tabela com os dados */}
      <TabelaAcoes />
    </section>
  );
};
