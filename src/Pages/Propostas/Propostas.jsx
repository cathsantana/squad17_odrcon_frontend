import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

export default function Propostas() {
  const { idManifestacao } = useParams()
  const [resultado, setResultado] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    async function carregarPropostas() {
      try {
        const resposta = await fetch(
          `/api/solucoes/reclamacao/${encodeURIComponent(idManifestacao)}`,
          { credentials: 'include', signal: controller.signal },
        )

        const mensagens = {
          401: 'Entre na sua conta para consultar as propostas.',
          403: 'Sua conta não tem acesso às propostas desta manifestação.',
          404: 'Manifestação não encontrada.',
        }

        if (!resposta.ok) {
          throw new Error(
            mensagens[resposta.status] ?? 'Não foi possível consultar as propostas.',
          )
        }

        const propostas = await resposta.json()
        if (!Array.isArray(propostas)) {
          throw new Error('A API não retornou uma lista de propostas.')
        }

        if (!controller.signal.aborted) {
          setResultado({ idManifestacao, propostas })
        }
      } catch (erro) {
        if (!controller.signal.aborted) {
          setResultado({ idManifestacao, erro: erro.message })
        }
      }
    }

    carregarPropostas()
    return () => controller.abort()
  }, [idManifestacao])

  const consulta = resultado?.idManifestacao === idManifestacao ? resultado : null

  return (
    <main>
      <h1>Propostas de solução</h1>
      <p>Manifestação #{idManifestacao}</p>

      {!consulta ? (
        <p role="status">Carregando propostas...</p>
      ) : consulta.erro ? (
        <p role="alert">{consulta.erro}</p>
      ) : consulta.propostas.length === 0 ? (
        <p>Nenhuma proposta registrada.</p>
      ) : (
        <ul>
          {consulta.propostas.map((proposta) => (
            <li key={proposta.idProposta}>
              <h2>{proposta.autorExibicao || 'Autor não registrado'}</h2>
              <p>{proposta.descricaoProposta}</p>
              <p>Status: {proposta.statusProposta}</p>
            </li>
          ))}
        </ul>
      )}

      <Link to="/">Voltar ao início</Link>
    </main>
  )
}