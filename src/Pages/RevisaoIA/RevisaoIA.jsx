import { useState } from "react";
import { Link } from "react-router-dom";
import "./RevisaoIA.css";

// Controle de disponibilidade da futura integração com a API
const INTEGRACAO_API_DISPONIVEL = false;

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
  const [reclamacoes, setReclamacoes] = useState([]);
  const [reclamacaoAtivaId, setReclamacaoAtivaId] = useState("");

  const [instrucoesIaPadrao, setInstrucoesIaPadrao] = useState("");
  const [observacoesPadrao, setObservacoesPadrao] = useState("");

  const [modoEdicaoManual, setModoEdicaoManual] = useState(false);
  const [textoEmEdicao, setTextoEmEdicao] = useState("");

  const reclamacaoAtiva =
    reclamacoes.find((r) => r.id === reclamacaoAtivaId) || null;

  const textoSugeridoAtual = reclamacaoAtiva?.textoSugerido || "";
  const statusSugestaoAtual = reclamacaoAtiva?.status || null;
  const possuiSugestao = Boolean(
    reclamacaoAtiva && textoSugeridoAtual.trim().length > 0
  );
  const podeGerarSugestao =
    INTEGRACAO_API_DISPONIVEL && Boolean(reclamacaoAtiva);

  const valorInstrucoesIa = reclamacaoAtiva
    ? reclamacaoAtiva.instrucoesIa ?? ""
    : instrucoesIaPadrao;

  const valorObservacoesRevisor = reclamacaoAtiva
    ? reclamacaoAtiva.observacoesRevisor ?? ""
    : observacoesPadrao;

  const selecionarReclamacao = (novoId) => {
    setModoEdicaoManual(false);
    setTextoEmEdicao("");
    setReclamacaoAtivaId(novoId);
  };

  const atualizarInstrucoesIa = (novoValor) => {
    if (!reclamacaoAtiva) {
      setInstrucoesIaPadrao(novoValor);
      return;
    }

    setReclamacoes((anteriores) =>
      anteriores.map((rec) =>
        rec.id === reclamacaoAtiva.id
          ? { ...rec, instrucoesIa: novoValor }
          : rec
      )
    );
  };

  const atualizarObservacoesRevisor = (novoValor) => {
    if (!reclamacaoAtiva) {
      setObservacoesPadrao(novoValor);
      return;
    }

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

  // Quando a integração estiver ativa, a nova sugestão substitui a anterior.
  // Se o campo de instruções estiver vazio, o backend utilizará apenas suas instruções padrão.
  const gerarNovaSugestao = () => {
    if (!podeGerarSugestao) return;

    const instrucaoAdicional = valorInstrucoesIa.trim();
    const dadosRequisicao = {
      reclamacaoId: reclamacaoAtiva.id,
      textoOriginal: reclamacaoAtiva.textoOriginal,
      usarApenasInstrucoesPadrao: instrucaoAdicional.length === 0,
      ...(instrucaoAdicional.length > 0 ? { instrucaoAdicional } : {}),
    };

    if (!dadosRequisicao) return;
  };

  return (
    <div className="revisao-ia-page">
      {/* Cabeçalho compacto */}
      <header className="revisao-topo">
        <h1 className="revisao-titulo-pagina">
          Revisão de Reclamações
        </h1>

        <div className="revisao-topo-acoes">
          {reclamacoes.length > 0 && (
            <select
              id="seletor-reclamacao"
              className="revisao-select-compacto"
              aria-label="Selecionar reclamação"
              value={reclamacaoAtiva ? reclamacaoAtiva.id : ""}
              onChange={(e) => selecionarReclamacao(e.target.value)}
            >
              {reclamacoes.map((rec) => (
                <option key={rec.id} value={rec.id}>
                  {rec.protocolo || rec.id}
                </option>
              ))}
            </select>
          )}

          <Link to="/reclamacao" className="revisao-link-voltar">
            ← Reclamações
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
            {reclamacaoAtiva?.textoOriginal ? (
              <p className="texto-conteudo">{reclamacaoAtiva.textoOriginal}</p>
            ) : (
              <p className="texto-estado-vazio" role="status">
                Nenhuma reclamação selecionada.
              </p>
            )}
          </div>
        </section>

        {/* 2. Instruções para a IA (opcional) */}
        <section
          className="revisao-bloco bloco-instrucoes"
          aria-labelledby="titulo-instrucoes-ia"
        >
          <div className="bloco-cabecalho">
            <label htmlFor="campo-instrucoes-ia" id="titulo-instrucoes-ia" className="bloco-titulo">
              Instruções para a IA (opcional)
            </label>
          </div>

          <textarea
            id="campo-instrucoes-ia"
            className="revisao-textarea"
            rows={2}
            placeholder="Ex.: Retire os palavrões, mantenha a mensagem em primeira pessoa e preserve a insatisfação."
            value={valorInstrucoesIa}
            onChange={(e) => atualizarInstrucoesIa(e.target.value)}
          />
        </section>

        {/* 3. Sugestão da IA */}
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
                : "Aguardando reformulação"}
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
                <p className="texto-conteudo">{textoSugeridoAtual}</p>
              )
            ) : (
              <p className="texto-estado-vazio" role="status">
                Aguardando reformulação
              </p>
            )}
          </div>
        </section>

        {/* 4. Botões de ação */}
        <section
          className="revisao-bloco bloco-acoes"
          aria-label="Ações do revisor"
        >
          <div className="barra-acoes-revisor">
            <button
              type="button"
              className={`btn-revisao btn-primario ${
                statusSugestaoAtual === STATUS_REVISAO.APROVADA
                  ? "btn-ativo"
                  : ""
              }`}
              onClick={aprovarSugestao}
              disabled={!possuiSugestao}
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
              disabled={!possuiSugestao}
            >
              ✕ Rejeitar sugestão
            </button>

            <button
              type="button"
              className={`btn-revisao btn-secundario ${
                modoEdicaoManual ? "btn-ativo" : ""
              }`}
              onClick={iniciarOuSalvarEdicaoManual}
              disabled={!possuiSugestao}
            >
              {modoEdicaoManual ? "✓ Salvar edição" : "✎ Editar sugestão"}
            </button>

            <button
              type="button"
              className="btn-revisao btn-primario"
              onClick={gerarNovaSugestao}
              disabled={!podeGerarSugestao}
            >
              ↻ Gerar nova sugestão
            </button>
          </div>
        </section>

        {/* 5. Observações do revisor (opcional) */}
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
            value={valorObservacoesRevisor}
            onChange={(e) => atualizarObservacoesRevisor(e.target.value)}
          />
        </section>
      </main>
    </div>
  );
}

export default RevisaoIA;
