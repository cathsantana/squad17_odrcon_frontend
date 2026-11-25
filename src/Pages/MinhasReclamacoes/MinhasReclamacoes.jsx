import { useEffect, useState } from "react";

export default function MinhasReclamacoes() {
  const [reclamacoes, setReclamacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/reclamacao/minhas", {
      credentials: "include", // manda o cookie da sessão
    })
      .then((res) => {
        if (res.status === 401) throw new Error("Faça login para ver suas reclamações.");
        if (!res.ok) throw new Error("Erro ao buscar reclamações.");
        return res.json();
      })
      .then(setReclamacoes)
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <div>
      <h1>Minhas reclamações</h1>

      {carregando && <p>Carregando...</p>}
      {erro && <p>{erro}</p>}
      {!carregando && !erro && reclamacoes.length === 0 && (
        <p>Você ainda não fez nenhuma reclamação.</p>
      )}

      <ul>
        {reclamacoes.map((r) => (
          <li key={r.idManifestacao}>
            <strong>{r.protocoloUnico}</strong> — {r.status}
            <br />
            {r.descricaoOriginal}
            <br />
            <small>{new Date(r.criadoEm).toLocaleString("pt-BR")}</small>
          </li>
        ))}
      </ul>
    </div>
  );
}