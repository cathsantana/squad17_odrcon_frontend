import { useState } from "react";

export default function ProcurarReclamacao() {
  const [protocolo, setProtocolo] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  async function buscar() {
    setErro("");
    setResultado(null);
    try {
      const res = await fetch(
        `http://localhost:8080/api/reclamacao/protocolo/${encodeURIComponent(protocolo.trim())}`
      );
      if (res.status === 404) {
        setErro("Protocolo não encontrado.");
        return;
      }
      if (!res.ok) throw new Error();
      setResultado(await res.json());
    } catch {
      setErro("Erro ao buscar. Tente novamente.");
    }
  }

  return (
    <div>
      <h1>Procurar reclamação</h1>

      <input
        value={protocolo}
        onChange={(e) => setProtocolo(e.target.value)}
        placeholder="Digite o protocolo"
      />
      <button onClick={buscar} disabled={!protocolo.trim()}>
        Buscar
      </button>

      {erro && <p>{erro}</p>}

      {resultado && (
        <div>
          <p><strong>Protocolo:</strong> {resultado.protocoloUnico}</p>
          <p><strong>Status:</strong> {resultado.status}</p>
          <p><strong>Descrição:</strong> {resultado.descricaoOriginal}</p>
          <p><small>{new Date(resultado.criadoEm).toLocaleString("pt-BR")}</small></p>
        </div>
      )}
    </div>
  );
}