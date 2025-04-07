import { Scroll } from "./components/scroll";
import { Simulador } from "./components/simulador";
import "./index.css";

function App() {
  return (
    <>
      <header>
        <nav className="conteiner">
          <div className="logo">
            Simula<span>Invest</span>
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
          <h1 className="titulo-destaque">Simule Sua Jornada de Investimentos</h1>
          <p className="subtitulo-destaque">
            SimulaInvest ajuda você a visualizar seu futuro financeiro com
            nossas poderosas ferramentas de simulação de investimentos.
          </p>
          <Scroll href="#simulador" className="botao botao-primario">
            Comece a Simular Agora
          </Scroll>
        </div>
        <div className="imagem-destaque">
          <img
            src="/src/assets/grafico.png"
            alt="Ilustração de crescimento de investimento"
          />
        </div>
      </section>
      <Simulador />
    </div>
    </>
  );
}
export default App;