import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './LandingPage.css';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Header/Navbar */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="logo">
            <span className="logo-text">Simula<span className="logo-highlight">Invest</span></span>
          </div>
          <div className="nav-actions">
            {isAuthenticated ? (
              <button onClick={() => navigate('/app')} className="btn btn-primary">
                Ir a la App
              </button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn btn-secondary">
                  Iniciar Sesión
                </button>
                <button onClick={() => navigate('/register')} className="btn btn-primary">
                  Registrarse
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Simula tus inversiones con <span className="highlight">confianza</span>
          </h1>
          <p className="hero-description">
            SimulaInvest es tu plataforma de simulación de inversiones que te permite 
            tomar decisiones financieras informadas antes de invertir tu dinero real.
          </p>
          <div className="hero-actions">
            <button onClick={handleGetStarted} className="btn btn-large btn-primary">
              Comenzar Ahora
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn btn-large btn-outline">
              Ver Características
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="chart-illustration">
            <div className="chart-bar" style={{height: '60%'}}></div>
            <div className="chart-bar" style={{height: '80%'}}></div>
            <div className="chart-bar" style={{height: '45%'}}></div>
            <div className="chart-bar" style={{height: '90%'}}></div>
            <div className="chart-bar" style={{height: '70%'}}></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2 className="section-title">¿Por qué SimulaInvest?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Simulación Realista</h3>
            <p>
              Experimenta con datos reales del mercado sin arriesgar tu capital. 
              Aprende y perfecciona tus estrategias de inversión.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Análisis Completo</h3>
            <p>
              Visualiza el rendimiento de tu portafolio con gráficos interactivos 
              y métricas detalladas en tiempo real.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Gestión de Portafolio</h3>
            <p>
              Crea y administra múltiples portafolios de inversión, 
              compara escenarios y toma decisiones informadas.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Escenarios Personalizados</h3>
            <p>
              Define tus propios escenarios de inversión y descubre 
              cómo diferentes estrategias impactan tus resultados.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Interfaz Intuitiva</h3>
            <p>
              Plataforma fácil de usar con diseño moderno y responsivo, 
              accesible desde cualquier dispositivo.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>100% Seguro</h3>
            <p>
              Tus datos están protegidos con las mejores prácticas de seguridad. 
              Simula sin preocupaciones.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works-section">
        <h2 className="section-title">Cómo funciona</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Regístrate gratis</h3>
            <p>Crea tu cuenta en segundos y accede a todas las funcionalidades</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Configura tu portafolio</h3>
            <p>Selecciona las acciones y define tus parámetros de inversión</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Simula y analiza</h3>
            <p>Observa los resultados y toma decisiones basadas en datos</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Listo para simular tus inversiones?</h2>
          <p>Únete a SimulaInvest hoy y comienza a tomar decisiones de inversión más inteligentes</p>
          <button onClick={handleGetStarted} className="btn btn-large btn-white">
            Comenzar Gratis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-text">Simula<span className="logo-highlight">Invest</span></span>
            <p>Tu plataforma de simulación de inversiones</p>
          </div>
          <div className="footer-links">
            <div className="footer-section">
              <h4>Producto</h4>
              <ul>
                <li><a href="#features">Características</a></li>
                <li><a href="#how-it-works">Cómo funciona</a></li>
                <li><a href="/register">Registrarse</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Empresa</h4>
              <ul>
                <li><a href="#about">Sobre nosotros</a></li>
                <li><a href="#contact">Contacto</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SimulaInvest. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
