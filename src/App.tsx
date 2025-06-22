import { Simulador } from "./components/Simulador";
import { UserDashboard } from "./components/UserDashboard";
import TabelaAcoes from "./components/TabelaAcoes";
import { useAuth } from './auth/AuthContext';
import "./index.css";
import "./App.css";

function App() {
  const { user, logout } = useAuth();

  if (!user) {
    return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Erro: Usuário não autenticado. Redirecionando...</div>;
  }

  return (
    <>
      <header>
        <nav className="conteiner">
          <div className="logo">
            <a href="/">Simula<span>Invest</span></a>
          </div>
          <div className="user-actions">
            <button onClick={logout} className="botao botao-secundario">
              Sair
            </button>
          </div>
        </nav>
      </header>
      <main className="conteiner" style={{ paddingTop: '80px', paddingBottom: '2rem' }}>
        <h1 className="titulo-destaque" style={{textAlign: 'center', marginBottom: '2rem'}}>
          Bem-vindo(a) ao SimulaInvest, {user.name}!
        </h1>
        <Simulador />
        <div style={{ marginTop: '3rem', borderTop: '2px solid #e2e8f0', paddingTop: '2rem' }}>
            <UserDashboard />
        </div>
        <div style={{ marginTop: '3rem', borderTop: '2px solid #e2e8f0', paddingTop: '2rem' }}>
            <TabelaAcoes />
        </div>
      </main>
    </>
  );
}

export default App;