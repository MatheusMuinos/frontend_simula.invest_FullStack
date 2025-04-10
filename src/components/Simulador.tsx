import { useState } from "react";
import axios from "axios";
import { Scroll } from "./Scroll";
import Grafico from "./Grafico";

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

  const [dadosGrafico, setDadosGrafico] = useState<{ labels: string[]; values: number[] }>({
    labels: [],
    values: [],
  });

  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");

  const formatarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "inicial" || id === "mensal" || id === "inflacao") {
      const cleanedValue = value.replace(/[^\d,]/g, "");
      const [inteiro, decimal] = cleanedValue.split(",");
      const formattedInt = inteiro
        ? parseInt(inteiro.replace(/\D/g, ""), 10).toLocaleString("pt-BR")
        : "";
      const formattedValue = decimal !== undefined ? `${formattedInt},${decimal}` : formattedInt;
      setValores((prev) => ({ ...prev, [id]: formattedValue }));
    } else {
      setValores((prev) => ({ ...prev, [id]: value }));
    }
  };

  const formatarSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    setValores((prev) => ({ ...prev, [id]: value }));
  };

  const stringParaFloat = (valor: string) => {
    return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
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

  const obterDadosAcao = async (): Promise<DadosAcao> => {
    const API_KEY = "O96I16GWZFH9OFYS";
    const symbol = "AAPL";

    try {
      let response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${API_KEY}`
      );

      if (response.data["Time Series (Monthly)"]) {
        const monthlyData = response.data["Time Series (Monthly)"];
        const closes = Object.values(monthlyData).map((entry: any) => parseFloat(entry["4. close"]));
        let totalGrowth = 0;
        for (let i = 1; i < closes.length; i++) {
          totalGrowth += (closes[i] - closes[i - 1]) / closes[i - 1];
        }
        const avgMonthlyGrowth = totalGrowth / (closes.length - 1);
        return { avgMonthlyGrowth, success: true };
      }

      throw new Error("Sem dados mensais disponíveis");
    } catch (error) {
      console.error("Erro na API:", error);
      return { avgMonthlyGrowth: taxasRetorno.acoes, success: false };
    }
  };

  const calcularInvestimento = async () => {
    setCarregando(true);
    setErroApi("");
    try {
      const investimentoInicial = stringParaFloat(valores.inicial);
      const contribuicaoMensal = stringParaFloat(valores.mensal);
      const meses = valores.meses;
      const inflacao = stringParaFloat(valores.inflacao) / 100;

      let taxaMensal = 0;
      if (valores.tipoInvestimento === "acoes") {
        const dados = await obterDadosAcao();
        taxaMensal = dados.avgMonthlyGrowth;
        if (!dados.success) {
          setErroApi("Usando dados simulados (API indisponível).");
        }
      } else {
        taxaMensal = taxasRetorno["renda-fixa"][
          valores.tipoRendaFixa as keyof typeof taxasRetorno["renda-fixa"]
        ];
      }

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

      const retorno = valorAtual - totalInvestido;
      const ajusteInflacao = valorAtual / Math.pow(1 + inflacao, meses);

      setResultados({
        valorFuturo: valorAtual,
        totalInvestido,
        retorno,
        ajusteInflacao,
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

        {valores.tipoInvestimento === "renda-fixa" && (
          <div className="grupo-formulario">
            <label htmlFor="tipoRendaFixa">Tipo de Renda Fixa</label>
            <select id="tipoRendaFixa" value={valores.tipoRendaFixa} onChange={formatarSelect}>
              <option value="cdb">CDB</option>
              <option value="tesouro-direto">Tesouro Direto</option>
              <option value="lci">LCI</option>
              <option value="lca">LCA</option>
              <option value="lc">LC</option>
              <option value="debentures">Debêntures</option>
              <option value="cri">CRI</option>
              <option value="cra">CRA</option>
              <option value="fundos-renda-fixa">Fundos Renda Fixa</option>
              <option value="poupanca">Poupança</option>
            </select>
          </div>
        )}
      </div>

      <Scroll
        href="#"
        className={`botao botao-primario ${carregando ? "botao-desabilitado" : ""}`}
        style={{ display: "block", width: "200px", margin: "0 auto 2rem" }}
        onClick={calcularInvestimento}
      >
        {carregando ? "Calculando..." : "Calcular Resultados"}
      </Scroll>

      <div className="resultados">
        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.valorFuturo)}</div>
          <div className="rotulo-resultado">Valor Futuro</div>
        </div>

        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.totalInvestido)}</div>
          <div className="rotulo-resultado">Total Investido</div>
        </div>

        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.retorno)}</div>
          <div className="rotulo-resultado">Retornos do Investimento</div>
        </div>

        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.ajusteInflacao)}</div>
          <div className="rotulo-resultado">Valor Ajustado pela Inflação</div>
        </div>
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
    </section>
  );
};
