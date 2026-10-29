import { Link } from "react-router-dom";

function App() {
  return (
    <div>
      <h1>Início</h1>
      <nav>
  <Link to="/reclamacao">Nova reclamação</Link>
  <br />
  <Link to="/dashboard">Dashboard</Link>
</nav>
    </div>
  );
}

export default App;