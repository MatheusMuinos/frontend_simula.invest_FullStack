import { useState } from "react";
import { Scroll } from "./Scroll";

export const Simulador = () => {
  const [valores, setValores] = useState({
    inicial: 0,
    mensal: 0,
    meses: 0,
    inflacao: 0,
  });

  const [resultados, setResultados] = useState({
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

  const stringParaFloat = (valor: string) => {
    return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  return (
    <section id="simulador" className="simulador">
      <h2 className="titulo-simulador">
        Simulador de Crescimento de Investimentos
      </h2>

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
      </div>

      <Scroll
        href="#"
        className="botao botao-primario"
        style={{ display: "block", width: "200px", margin: "0 auto 2rem" }}
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
