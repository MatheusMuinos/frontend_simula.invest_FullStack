import { Scroll } from "./components/Scroll";
import { Simulador } from "./components/Simulador";
import { useAuth } from './auth/AuthContext';
import Grafico from "./components/Grafico";
import TabelaAcoes from "./components/TabelaAcoes";
import "./index.css";
import "./App.css";

function App() {
  const exemploDados = {
    labels: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"],
    values: [1200, 1900, 1500, 2000, 1800, 2400],
  };

  const { user, logout } = useAuth();

  return (
    <>
      <header>
        <nav className="conteiner">
          <div className="logo">
            <a href="/">Simula<span>Invest</span></a>
          </div>
          
          {user && (
            <div className="user-actions">
              <span>Olá, {user.name}</span>
              <button onClick={logout} className="botao-secundario">
                Sair
              </button>
            </div>
          )}
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
        
        {/* colocando abaixo do simulador */}
        <TabelaAcoes />
      </div>
    </>
  );
}

export default App;
