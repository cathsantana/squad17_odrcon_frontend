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

const API = "/api";

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [porMes, setPorMes] = useState([]);
  const [porPrioridade, setPorPrioridade] = useState([]);
  const [who5, setWho5] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function buscarDados(caminho, esperaLista = false) {
      const resposta = await fetch(`${API}${caminho}`, {
        credentials: "include",
        signal: controller.signal,
      });

      if (resposta.status === 401 || resposta.status === 403) {
        throw new Error(
          "Sua sessão não está autorizada. Faça login novamente."
        );
      }

      if (!resposta.ok) {
        throw new Error(
          `Não foi possível carregar ${caminho}. Status ${resposta.status}.`
        );
      }

      const dados = await resposta.json();

      if (esperaLista && !Array.isArray(dados)) {
        throw new Error(
          `A API retornou um formato inválido em ${caminho}.`
        );
      }

      return dados;
    }

    async function carregarDashboard() {
      setCarregando(true);
      setErro("");

      try {
        const [
          dadosResumo,
          dadosPorMes,
          dadosPorPrioridade,
          dadosWho5,
        ] = await Promise.all([
          buscarDados("/resumo"),
          buscarDados("/reclamacoes-por-mes", true),
          buscarDados("/reclamacoes-por-prioridade", true),
          buscarDados("/who5-por-mes", true),
        ]);

        if (controller.signal.aborted) return;

        if (
          !dadosResumo ||
          !Number.isFinite(dadosResumo.totalReclamacoes) ||
          !Number.isFinite(dadosResumo.percentualResolvidas) ||
          !Number.isFinite(dadosResumo.mediaWho5)
        ) {
          throw new Error("A API retornou um resumo em formato inválido.");
        }

        setResumo(dadosResumo);
        setPorMes(dadosPorMes);
        setPorPrioridade(dadosPorPrioridade);
        setWho5(dadosWho5);
      } catch (error) {
        if (controller.signal.aborted) return;

        setErro(
          error.message || "Não foi possível carregar o dashboard."
        );
      } finally {
        if (!controller.signal.aborted) {
          setCarregando(false);
        }
      }
    }

    carregarDashboard();

    return () => controller.abort();
  }, []);

  if (carregando) {
    return (
      <div className="dashboard" role="status">
        Carregando dashboard...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="dashboard">
        <p role="alert">{erro}</p>
        <a href="/login">Ir para o login</a>
      </div>
    );
  }

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
          <div className="kpi-caixa">
            {resumo.totalReclamacoes}
          </div>
        </div>

        <div>
          <span className="kpi-titulo">Reclamações resolvidas</span>
          <div className="kpi-caixa">
            {resumo.percentualResolvidas}%
          </div>
        </div>

        <div>
          <span className="kpi-titulo">Média WHO-5</span>
          <div className="kpi-caixa">{resumo.mediaWho5}</div>
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
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6f6f6f"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grafico-card">
          <h3 className="grafico-titulo">
            Reclamações por prioridade
          </h3>
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
                <Line
                  type="monotone"
                  dataKey="media"
                  stroke="#6f6f6f"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;