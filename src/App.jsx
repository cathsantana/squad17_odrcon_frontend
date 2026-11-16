import { Link } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <div className="home-page">
      <header className="home-header">
        <strong>ODRCON</strong>
        <span>Sistema de manifestações</span>
      </header>

      <main className="home-content">
        <h1>Início</h1>
        <p className="home-description">
          Selecione uma das opções abaixo para continuar.
        </p>

        <div className="home-options">
          <section className="home-option">
            <h2>Registrar manifestação</h2>
            <p>
              Acesse o formulário para registrar sua manifestação.
              Você pode escolher a opção anônima, sem precisar de conta.
            </p>
            <Link to="/reclamacao" className="home-link">
              Abrir formulário
            </Link>
          </section>

          <section className="home-option">
            <h2>Acesso da equipe</h2>
            <p>
              Entre com suas credenciais para acompanhar e gerenciar
              as manifestações.
            </p>
            <Link to="/login" className="home-link">
              Fazer login
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App