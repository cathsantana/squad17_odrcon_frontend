import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API = "http://localhost:8080/api";

function App() {
  const [resumo, setResumo] = useState(null);
  const [porMes, setPorMes] = useState([]);
  const [porPrioridade, setPorPrioridade] = useState([]);
  const [who5, setWho5] = useState([]);

  useEffect(() => {
    fetch(`${API}/resumo`)
      .then((r) => r.json())
      .then(setResumo);

    fetch(`${API}/reclamacoes-por-mes`)
      .then((r) => r.json())
      .then(setPorMes);

    fetch(`${API}/reclamacoes-por-prioridade`)
      .then((r) => r.json())
      .then(setPorPrioridade);

    fetch(`${API}/who5-por-mes`)
      .then((r) => r.json())
      .then(setWho5);
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>

      {resumo && (
        <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
          <div>
            <strong>Total de reclamações</strong>
            <p>{resumo.totalReclamacoes}</p>
          </div>
          <div>
            <strong>% resolvidas</strong>
            <p>{resumo.percentualResolvidas}%</p>
          </div>
          <div>
            <strong>Média WHO-5</strong>
            <p>{resumo.mediaWho5}</p>
          </div>
        </div>
      )}

      <h2>Reclamações por mês</h2>
      <LineChart width={500} height={250} data={porMes}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="#8884d8" />
      </LineChart>

      <h2>Reclamações por prioridade</h2>
      <BarChart width={500} height={250} data={porPrioridade}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="prioridade" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="total" fill="#82ca9d" />
      </BarChart>

      <h2>Evolução do WHO-5</h2>
      <LineChart width={500} height={250} data={who5}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mes" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="media" stroke="#ff7300" />
      </LineChart>
    </div>
  );
}

export default App;