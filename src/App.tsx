import { Scroll } from "./components/Scroll";
import { Simulador } from "./components/Simulador";
import Grafico from "./components/Grafico";
import "./index.css";

function App() {
  const exemploDados = {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
    values: [1200, 1900, 1500, 2000, 1800, 2400],
  };

  return (
    <>
      <header>
        <nav className="conteiner">
          <div className="logo">
            <a href="/">
              Simula<span>Invest</span>
            </a>
          </div>
          <div className="botoes-acesso">
            <Scroll href="#simulador" className="botao botao-primario">
              Começar
            </Scroll>
          </div>
        </nav>
      </header>
      <div className="conteiner">
        <section className="destaque">
          <div className="conteudo-destaque">
            <h1 className="titulo-destaque">
              Simule Sua Jornada de Investimentos
            </h1>
            <p className="subtitulo-destaque">
              SimulaInvest ajuda você a visualizar seu futuro financeiro com
              nossas poderosas ferramentas de simulação de investimentos.
            </p>
            <Scroll href="#simulador" className="botao botao-primario">
              Comece a Simular Agora
            </Scroll>
          </div>
          <div className="container-grafico">
            <Grafico dados={exemploDados} />
          </div>
        </section>
        {/* adicionando simuladorr */}
        <Simulador />
        
      </div>
    </>
  );
}

export default App;
