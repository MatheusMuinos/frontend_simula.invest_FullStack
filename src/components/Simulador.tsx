import { useState } from 'react';
import { Scroll } from './Scroll';

export const Simulador = () => {
  const [valores, setValores] = useState({
    initial: 10000,
    monthly: 500,
    years: 30,
    return: 8,
    inflation: 2.5,
    tax: 15
  });

  const [resultados] = useState({
    futureValue: 725604,
    totalContributions: 437258,
    investmentReturns: 288346,
    inflationAdjusted: 394521
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValores({
      ...valores,
      [e.target.id]: parseFloat(e.target.value) || 0
    });
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <section id="simulador" className="simulador">
      <h2 className="titulo-simulador">
        Simulador de Crescimento de Investimentos
      </h2>
      
      <div className="formulario-simulador">
        <div className="grupo-formulario">
          <label htmlFor="initial">Investimento Inicial (R$)</label>
          <input
            type="number"
            id="initial"
            value={valores.initial}
            min="0"
            onChange={handleChange}
          />
        </div>
        
        <div className="grupo-formulario">
          <label htmlFor="monthly">Contribuição Mensal (R$)</label>
          <input
            type="number"
            id="monthly"
            value={valores.monthly}
            min="0"
            onChange={handleChange}
          />
        </div>
        
        <div className="grupo-formulario">
          <label htmlFor="years">Período de Investimento (Anos)</label>
          <input
            type="number"
            id="years"
            value={valores.years}
            min="1"
            max="50"
            onChange={handleChange}
          />
        </div>
        
        <div className="grupo-formulario">
          <label htmlFor="return">Retorno Anual Esperado (%)</label>
          <input
            type="number"
            id="return"
            value={valores.return}
            min="0"
            max="30"
            step="0.1"
            onChange={handleChange}
          />
        </div>
        
        <div className="grupo-formulario">
          <label htmlFor="inflation">Taxa de Inflação Esperada (%)</label>
          <input
            type="number"
            id="inflation"
            value={valores.inflation}
            min="0"
            max="20"
            step="0.1"
            onChange={handleChange}
          />
        </div>
        
        <div className="grupo-formulario">
          <label htmlFor="tax">Alíquota de Imposto (%)</label>
          <input
            type="number"
            id="tax"
            value={valores.tax}
            min="0"
            max="50"
            onChange={handleChange}
          />
        </div>
      </div>

      <Scroll 
        href="#" 
        className="botao botao-primario" 
        style={{ display: 'block', width: '200px', margin: '0 auto 2rem' }}
      >
        Calcular Resultados
      </Scroll>

      <div className="resultados">
        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.futureValue)}</div>
          <div className="rotulo-resultado">Valor Futuro</div>
        </div>
        
        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.totalContributions)}</div>
          <div className="rotulo-resultado">Total de Contribuições</div>
        </div>
        
        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.investmentReturns)}</div>
          <div className="rotulo-resultado">Retornos do Investimento</div>
        </div>
        
        <div className="cartao-resultado">
          <div className="valor-resultado">{formatarMoeda(resultados.inflationAdjusted)}</div>
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