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
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const API = "http://localhost:8080/api";

function Dashboard() {
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
    <div className="dashboard">
      {/* Filtro (ainda sem função) */}
      <div className="filtro">
        <span className="filtro-icone">▼</span>
        <select defaultValue="todos">
          <option value="todos">Todo o período</option>
          <option value="mes">Último mês</option>
          <option value="trimestre">Último trimestre</option>
        </select>
      </div>

      {/* Cartões de números */}
      <div className="kpis">
        <div>
          <span className="kpi-titulo">Total de reclamações</span>
          <div className="kpi-caixa">{resumo ? resumo.totalReclamacoes : "-"}</div>
        </div>
        <div>
          <span className="kpi-titulo">Reclamações resolvidas</span>
          <div className="kpi-caixa">
            {resumo ? `${resumo.percentualResolvidas}%` : "-"}
          </div>
        </div>
        <div>
          <span className="kpi-titulo">Média WHO-5</span>
          <div className="kpi-caixa">{resumo ? resumo.mediaWho5 : "-"}</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="graficos">
        <div className="grafico-card">
          <h3 className="grafico-titulo">Reclamações por mês</h3>
          <div className="grafico-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={porMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#6f6f6f" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grafico-card">
          <h3 className="grafico-titulo">Reclamações por prioridade</h3>
          <div className="grafico-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porPrioridade}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prioridade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#6f6f6f" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grafico-card">
          <h3 className="grafico-titulo">Evolução do WHO-5</h3>
          <div className="grafico-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={who5}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="media" stroke="#6f6f6f" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;