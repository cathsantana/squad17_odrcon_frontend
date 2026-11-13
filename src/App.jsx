import { Link } from 'react-router-dom'

function App() {
  return (
    <main>
      <h1>ODRCON</h1>
      <p>Escolha como deseja acessar o sistema.</p>

      <nav aria-label="Acessos principais">
        <Link to="/reclamacao">Registrar manifestação</Link>
        <p>Você pode registrar uma manifestação anônima, sem fazer login.</p>

        <Link to="/login">Acesso da equipe</Link>
      </nav>
    </main>
  )
}

export default App