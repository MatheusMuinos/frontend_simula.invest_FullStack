import { useState } from "react";
import axios from "axios";
import { Scroll } from "./Scroll";

type Valores = {
  inicial: string;
  mensal: string;
  meses: number;
  inflacao: string;
  tipoInvestimento: string; // Tipo de investimento (Ações ou Renda Fixa)
  tipoRendaFixa: string; // Tipo de Renda Fixa (CDB, Tesouro Direto, etc.)
};

type Resultados = {
  valorFuturo: number;
  totalInvestido: number;
  retorno: number;
  ajusteInflacao: number;
};

// Tipagem para a resposta da API Alpha Vantage (dados de ações)
type ApiResponse = {
  "Time Series (Daily)": Record<string, { "4. close": string }>;
};

export const Simulador = () => {
  const [valores, setValores] = useState<Valores>({
    inicial: "0",
    mensal: "0",
    meses: 0,
    inflacao: "0",
    tipoInvestimento: "acoes", // Valor padrão
    tipoRendaFixa: "cdb", // Tipo padrão de Renda Fixa
  });

  const [resultados, setResultados] = useState<Resultados>({
    valorFuturo: 0,
    totalInvestido: 0,
    retorno: 0,
    ajusteInflacao: 0,
  });

  const formatarInput = (entrada: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = entrada.target;

    if (id === "inicial" || id === "mensal" || id === "inflacao") {
      const inputDefault = value.replace(/[^\d,]/g, "");
      const [inteiro, decimal] = inputDefault.split(",");
      const inteiroFormatado = inteiro
        ? parseInt(inteiro.replace(/\D/g, ""), 10).toLocaleString("pt-BR")
        : "";

      const valorFormatado =
        decimal !== undefined
          ? `${inteiroFormatado},${decimal}`
          : inteiroFormatado;

      setValores({
        ...valores,
        [id]: valorFormatado,
      });
    } else {
      setValores({
        ...valores,
        [id]: value,
      });
    }
  };

  const formatarSelect = (entrada: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = entrada.target;
    setValores({
      ...valores,
      [id]: value,
    });
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

  
  const obterCotacaoAcao = async (acao: string) => {
    const apiKey = "O96I16GWZFH9OFYS"; 
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${acao}&apikey=${apiKey}`;

    try {
      const response = await axios.get<ApiResponse>(url);
      const data = response.data["Time Series (Daily)"];
      
    
      const precoInicial = parseFloat(Object.values(data)[0]["4. close"]); 
      const precoFinal = parseFloat(Object.values(data)[valores.meses - 1]["4. close"]);
      return { precoInicial, precoFinal };
    } catch (error) {
      console.error("Erro ao obter cotação de ação:", error);
      return { precoInicial: 0, precoFinal: 0 };
    }
  };

  // taxas
  const taxas: Record<string, number> = {
    cdb: 0.5 / 100, // 0.5% ao mês
    "tesouro-direto": 0.35 / 100, // 0.35% ao mês
    lci: 0.4 / 100, // 0.4% ao mês
    lca: 0.4 / 100, // 0.4% ao mês
    lc: 0.45 / 100, // 0.45% ao mês
    debentures: 0.6 / 100, // 0.6% ao mês
    cri: 0.5 / 100, // 0.5% ao mês
    cra: 0.5 / 100, // 0.5% ao mês
    "fundos-renda-fixa": 0.45 / 100, // 0.45% ao mês
    poupanca: 0.3 / 100, // 0.3% ao mês
  };


  const obterTaxaRendaFixa = (tipoRendaFixa: string) => {
  
    return taxas[tipoRendaFixa] || 0;
  };


  const calcularInvestimento = async () => {
    try {
      const investimentoInicial = stringParaFloat(valores.inicial);
      const contribuicaoMensal = stringParaFloat(valores.mensal);
      const meses = valores.meses;
      const inflacao = stringParaFloat(valores.inflacao);

      let valorFuturo = 0;

  
      if (valores.tipoInvestimento === "acoes") {

        const dadosAcao = await obterCotacaoAcao("AAPL"); 
        const precoInicial = dadosAcao.precoInicial;
        const precoFinal = dadosAcao.precoFinal;

       
        valorFuturo =
          investimentoInicial * (precoFinal / precoInicial) + contribuicaoMensal * meses;
      } else if (valores.tipoInvestimento === "renda-fixa") {
        
        const taxaRendaFixa = obterTaxaRendaFixa(valores.tipoRendaFixa); 

        
        valorFuturo =
          investimentoInicial * Math.pow(1 + taxaRendaFixa, meses) +
          contribuicaoMensal * ((Math.pow(1 + taxaRendaFixa, meses) - 1) / taxaRendaFixa);
      }

    
      const totalInvestido = investimentoInicial + contribuicaoMensal * meses;
      const retorno = valorFuturo - totalInvestido;
      const ajusteInflacao = valorFuturo * (1 - inflacao / 100);

      setResultados({
        valorFuturo,
        totalInvestido,
        retorno,
        ajusteInflacao,
      });
    } catch (error) {
      console.error("Erro ao calcular investimento:", error);
    }
  };

  return (
    <section id="simulador" className="simulador">
      <h2 className="titulo-simulador">Simulador de Crescimento de Investimentos</h2>

      <div className="formulario-simulador">
        <div className="grupo-formulario">
          <label htmlFor="inicial">Investimento Inicial (R$)</label>
          <input
            type="text"
            id="inicial"
            value={valores.inicial}
            inputMode="numeric"
            onChange={formatarInput}
          />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="mensal">Contribuição Mensal (R$)</label>
          <input
            type="text"
            id="mensal"
            value={valores.mensal}
            inputMode="numeric"
            onChange={formatarInput}
          />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="meses">Período de Investimento (Meses)</label>
          <input
            type="number"
            id="meses"
            value={valores.meses}
            min="0"
            max="9999"
            onChange={formatarInput}
          />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="inflacao">Taxa de Inflação Esperada (%)</label>
          <input
            type="text"
            id="inflacao"
            value={valores.inflacao}
            inputMode="numeric"
            onChange={formatarInput}
          />
        </div>

        <div className="grupo-formulario">
          <label htmlFor="tipoInvestimento">Tipo de Investimento</label>
          <select
            id="tipoInvestimento"
            value={valores.tipoInvestimento}
            onChange={formatarSelect}
          >
            <option value="acoes">Ações</option>
            <option value="renda-fixa">Renda Fixa</option>
          </select>
        </div>

        {valores.tipoInvestimento === "renda-fixa" && (
          <div className="grupo-formulario">
            <label htmlFor="tipoRendaFixa">Tipo de Renda Fixa</label>
            <select
              id="tipoRendaFixa"
              value={valores.tipoRendaFixa}
              onChange={formatarSelect}
            >
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
        className="botao botao-primario"
        style={{ display: "block", width: "200px", margin: "0 auto 2rem" }}
        onClick={calcularInvestimento}
      >
        Calcular Resultados
      </Scroll>

      <div className="resultados">
        <div className="cartao-resultado">
          <div className="valor-resultado">
            {formatarMoeda(resultados.valorFuturo)}
          </div>
          <div className="rotulo-resultado">Valor Futuro</div>
        </div>

        <div className="cartao-resultado">
          <div className="valor-resultado">
            {formatarMoeda(resultados.totalInvestido)}
          </div>
          <div className="rotulo-resultado">Total Investido</div>
        </div>

        <div className="cartao-resultado">
          <div className="valor-resultado">
            {formatarMoeda(resultados.retorno)}
          </div>
          <div className="rotulo-resultado">Retornos do Investimento</div>
        </div>

        <div className="cartao-resultado">
          <div className="valor-resultado">
            {formatarMoeda(resultados.ajusteInflacao)}
          </div>
          <div className="rotulo-resultado">Valor Ajustado pela Inflação</div>
        </div>
      </div>

      <div className="grafico">
        <div className="placeholder-grafico">
          [Gráfico de Crescimento do Investimento]
        </div>
      </div>
    </section>
  );
};
