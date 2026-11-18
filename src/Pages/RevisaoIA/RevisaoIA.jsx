import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { reformularReclamacao } from "../../api.js";
import "./RevisaoIA.css";

const STATUS_REVISAO = {
  EM_ANALISE: "em_analise",
  APROVADA: "aprovada",
  REJEITADA: "rejeitada",
};

const ROTULOS_STATUS = {
  [STATUS_REVISAO.EM_ANALISE]: "● Em análise",
  [STATUS_REVISAO.APROVADA]: "✓ Aprovada",
  [STATUS_REVISAO.REJEITADA]: "✕ Rejeitada",
};

function RevisaoIA() {
  const { state } = useLocation();
  const reformulacaoPublica = !state?.reclamacao || state.reformulacaoPublica === true;
  const [rascunho, setRascunho] = useState(state?.reclamacao?.textoOriginal ?? "");
  const iniciouGeracao = useRef(false);
  const [reclamacoes, setReclamacoes] = useState(() =>
    state?.reclamacao ? [state.reclamacao] : []
  );
  const [reclamacaoAtivaId, setReclamacaoAtivaId] = useState(state?.reclamacao?.id ?? "");
  const [gerando, setGerando] = useState(false);
  const [erroGeracao, setErroGeracao] = useState(null);

  const [modoEdicaoManual, setModoEdicaoManual] = useState(false);
  const [textoEmEdicao, setTextoEmEdicao] = useState("");

  const reclamacaoAtiva =
    reclamacoes.find((r) => r.id === reclamacaoAtivaId) || null;

  const textoOriginal = reformulacaoPublica ? rascunho : reclamacaoAtiva?.textoOriginal;
  const [sugestaoPublica, setSugestaoPublica] = useState("");
  const [sugestaoRecusada, setSugestaoRecusada] = useState(false);
  const textoSugeridoAtual = reformulacaoPublica ? sugestaoPublica : reclamacaoAtiva?.textoSugerido || "";
  const statusSugestaoAtual = reformulacaoPublica
    ? (sugestaoRecusada ? STATUS_REVISAO.REJEITADA : null)
    : reclamacaoAtiva?.status || null;
  const possuiSugestao = Boolean(textoSugeridoAtual.trim());
  const podeGerarSugestao =
    Boolean(textoOriginal?.trim()) && textoOriginal.length <= 5000 && !gerando && !modoEdicaoManual;

  const valorObservacoesRevisor = reclamacaoAtiva?.observacoesRevisor ?? "";

  const selecionarReclamacao = (novoId) => {
    setErroGeracao(null);
    setModoEdicaoManual(false);
    setTextoEmEdicao("");
    setReclamacaoAtivaId(novoId);
  };

  const atualizarObservacoesRevisor = (novoValor) => {
    if (!reclamacaoAtiva) return;

    setReclamacoes((anteriores) =>
      anteriores.map((rec) =>
        rec.id === reclamacaoAtiva.id
          ? { ...rec, observacoesRevisor: novoValor }
          : rec
      )
    );
  };

  const aprovarSugestao = () => {
    if (!reclamacaoAtiva || !possuiSugestao) return;

    const textoFinal =
      modoEdicaoManual && textoEmEdicao.trim().length > 0
        ? textoEmEdicao.trim()
        : reclamacaoAtiva.textoSugerido;

    setReclamacoes((anteriores) =>
      anteriores.map((rec) =>
        rec.id === reclamacaoAtiva.id
          ? {
              ...rec,
              textoSugerido: textoFinal,
              status: STATUS_REVISAO.APROVADA,
            }
          : rec
      )
    );

    if (modoEdicaoManual) {
      setModoEdicaoManual(false);
      setTextoEmEdicao("");
    }
  };

  const rejeitarSugestao = () => {
    if (!reclamacaoAtiva || !possuiSugestao) return;

    setReclamacoes((anteriores) =>
      anteriores.map((rec) =>
        rec.id === reclamacaoAtiva.id
          ? {
              ...rec,
              status: STATUS_REVISAO.REJEITADA,
            }
          : rec
      )
    );

    if (modoEdicaoManual) {
      setModoEdicaoManual(false);
      setTextoEmEdicao("");
    }
  };

  const iniciarOuSalvarEdicaoManual = () => {
    if (!reclamacaoAtiva || !possuiSugestao) return;

    if (!modoEdicaoManual) {
      setTextoEmEdicao(reclamacaoAtiva.textoSugerido);
      setModoEdicaoManual(true);
      return;
    }

    salvarEdicaoManual();
  };

  const salvarEdicaoManual = () => {
    if (!reclamacaoAtiva || !possuiSugestao) return;

    const textoLimpo = textoEmEdicao.trim();
    if (!textoLimpo) return;

    setReclamacoes((anteriores) =>
      anteriores.map((rec) =>
        rec.id === reclamacaoAtiva.id
          ? {
              ...rec,
              textoSugerido: textoLimpo,
              foiEditada: true,
            }
          : rec
      )
    );

    setModoEdicaoManual(false);
    setTextoEmEdicao("");
  };

  const cancelarEdicaoManual = () => {
    setModoEdicaoManual(false);
    setTextoEmEdicao("");
  };

  const gerarNovaSugestao = async () => {
    if (!podeGerarSugestao) return;

    const id = reclamacaoAtiva?.id;
    setGerando(true);
    setErroGeracao(null);

    try {
      const textoSugerido = await reformularReclamacao(textoOriginal);
      if (reformulacaoPublica) {
        setSugestaoPublica(textoSugerido);
        setSugestaoRecusada(false);
        return;
      }
      setReclamacoes((anteriores) =>
        anteriores.map((rec) =>
          rec.id === id
            ? { ...rec, textoSugerido, status: STATUS_REVISAO.EM_ANALISE, foiEditada: false }
            : rec
        )
      );
    } catch (error) {
      setErroGeracao(
        error instanceof TypeError ? "Não foi possível conectar ao servidor." : error.message
      );
    } finally {
      setGerando(false);
    }
  };

  const gerarPrimeiraSugestao = useEffectEvent(() => {
    if (!reformulacaoPublica && !possuiSugestao) void gerarNovaSugestao();
  });

  useEffect(() => {
    if (!iniciouGeracao.current) {
      iniciouGeracao.current = true;
      gerarPrimeiraSugestao();
    }
  }, []);

  return (
    <div className="revisao-ia-page">
      {/* Cabeçalho compacto */}
      <header className="revisao-topo">
        <h1 className="revisao-titulo-pagina">
          Revisão de Reclamações
        </h1>

        <div className="revisao-topo-acoes">
          {!reformulacaoPublica && reclamacoes.length > 0 && (
            <select
              id="seletor-reclamacao"
              className="revisao-select-compacto"
              aria-label="Selecionar reclamação"
              value={reclamacaoAtiva ? reclamacaoAtiva.id : ""}
              disabled={gerando}
              onChange={(e) => selecionarReclamacao(e.target.value)}
            >
              {reclamacoes.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.protocolo || rec.id}
                </option>
              ))}
            </select>
          )}

          <Link
            to="/"
            className="revisao-link-voltar"
          >
            ← Início
          </Link>
        </div>
      </header>

      <main className="revisao-conteudo">
        {/* 1. Reclamação original */}
        <section
          className="revisao-bloco bloco-original"
          aria-labelledby="titulo-reclamacao-original"
        >
          <div className="bloco-cabecalho">
            <h2 id="titulo-reclamacao-original" className="bloco-titulo">
              Reclamação original
            </h2>
            {reclamacaoAtiva?.protocolo && (
              <span className="protocolo-identificador">
                {reclamacaoAtiva.protocolo}
              </span>
            )}
          </div>

          <div className="caixa-leitura caixa-original">
            {reformulacaoPublica ? (
              <textarea
                className="revisao-textarea textarea-edicao"
                aria-labelledby="titulo-reclamacao-original"
                placeholder="Descreva o ocorrido."
                rows={6}
                maxLength={5000}
                value={rascunho}
                readOnly={gerando}
                onChange={(event) => {
                  setRascunho(event.target.value);
                  setSugestaoPublica("");
                  setSugestaoRecusada(false);
                  setErroGeracao(null);
                }}
              />
            ) : reclamacaoAtiva?.textoOriginal ? (
              <p className="texto-conteudo">{reclamacaoAtiva.textoOriginal}</p>
            ) : (
              <p className="texto-estado-vazio" role="status">
                Nenhuma reclamação selecionada.
              </p>
            )}
          </div>
        </section>

        {/* 2. Sugestão da IA */}
        <section
          className="revisao-bloco bloco-sugestao"
          aria-labelledby="titulo-sugestao-ia"
        >
          <div className="bloco-cabecalho">
            <h2 id="titulo-sugestao-ia" className="bloco-titulo">
              Sugestão da IA
            </h2>
            <span
              className={`status-indicador ${
                statusSugestaoAtual
                  ? `status-${statusSugestaoAtual}`
                  : "status-pendente"
              }`}
            >
              {statusSugestaoAtual
                ? ROTULOS_STATUS[statusSugestaoAtual]
                : gerando ? "Reformulando…" : possuiSugestao ? "Sugestão gerada" : "Aguardando reformulação"}
            </span>
          </div>

          <div className="caixa-leitura caixa-sugestao">
            {possuiSugestao ? (
              modoEdicaoManual ? (
                <div className="edicao-manual-container">
                  <textarea
                    id="editor-manual-sugestao"
                    aria-label="Editar sugestão da IA"
                    className="revisao-textarea textarea-edicao"
                    rows={5}
                    value={textoEmEdicao}
                    onChange={(e) => setTextoEmEdicao(e.target.value)}
                  />
                  <div className="edicao-manual-acoes">
                    <button
                      type="button"
                      className="btn-revisao btn-primario"
                      onClick={salvarEdicaoManual}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      className="btn-revisao btn-secundario"
                      onClick={cancelarEdicaoManual}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="texto-conteudo" role="status">{textoSugeridoAtual}</p>
              )
            ) : (
              <p className="texto-estado-vazio" role="status">
                Aguardando reformulação
              </p>
            )}
          </div>
        </section>

        {/* 3. Botões de ação */}
        <section
          className="revisao-bloco bloco-acoes"
          aria-label={reformulacaoPublica ? "Ações de reformulação" : "Ações do revisor"}
        >
          <div className="barra-acoes-revisor">
            {!reformulacaoPublica && (
              <>
                <button
                  type="button"
                  className={`btn-revisao btn-primario ${
                    statusSugestaoAtual === STATUS_REVISAO.APROVADA
                      ? "btn-ativo"
                      : ""
                  }`}
                  onClick={aprovarSugestao}
                  disabled={!possuiSugestao || gerando}
                >
                  ✓ Aprovar sugestão
                </button>

                <button
                  type="button"
                  className={`btn-revisao btn-secundario ${
                    statusSugestaoAtual === STATUS_REVISAO.REJEITADA
                      ? "btn-ativo"
                      : ""
                  }`}
                  onClick={rejeitarSugestao}
                  disabled={!possuiSugestao || gerando}
                >
                  ✕ Rejeitar sugestão
                </button>

                <button
                  type="button"
                  className={`btn-revisao btn-secundario ${
                    modoEdicaoManual ? "btn-ativo" : ""
                  }`}
                  onClick={iniciarOuSalvarEdicaoManual}
                  disabled={!possuiSugestao || gerando}
                >
                  {modoEdicaoManual ? "✓ Salvar edição" : "✎ Editar sugestão"}
                </button>
              </>
            )}

            <button
              type="button"
              className="btn-revisao btn-primario"
              onClick={gerarNovaSugestao}
              disabled={!podeGerarSugestao}
            >
              {gerando ? "Gerando sugestão…" : possuiSugestao ? "Gerar nova sugestão" : reformulacaoPublica ? "Enviar para a IA" : "Gerar sugestão"}
            </button>
            {reformulacaoPublica && (
              <button
                type="button"
                className="btn-revisao btn-secundario"
                onClick={() => setSugestaoRecusada(true)}
                disabled={!possuiSugestao || gerando || sugestaoRecusada}
              >
                Recusar sugestão
              </button>
            )}
          </div>
          {gerando && <p role="status">Aguardando a reformulação da IA.</p>}
          {erroGeracao && <p role="alert">{erroGeracao}</p>}
        </section>

        {!reformulacaoPublica && (
          <section
            className="revisao-bloco bloco-observacoes"
            aria-labelledby="titulo-observacoes-revisor"
          >
            <div className="bloco-cabecalho">
              <label
                htmlFor="campo-observacoes-revisor"
                id="titulo-observacoes-revisor"
                className="bloco-titulo"
              >
                Observações do revisor (opcional)
              </label>
            </div>

            <textarea
              id="campo-observacoes-revisor"
              className="revisao-textarea"
              rows={2}
              placeholder="Registre observações internas sobre esta revisão..."
              disabled={!reclamacaoAtiva}
              value={valorObservacoesRevisor}
              onChange={(e) => atualizarObservacoesRevisor(e.target.value)}
            />
          </section>
        )}
      </main>
    </div>
  );
}

export default RevisaoIA;
