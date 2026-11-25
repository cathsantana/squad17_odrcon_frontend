
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import '../Login/Login.css'
import './Cliente.css'

import BotaoSair from '../../Components/BotaoSair/BotaoSair.jsx'

export default function Cliente() {
  const navigate = useNavigate()

  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    async function verificarSessao() {
      try {
        const resposta = await fetch('/api/auth/me', {
          credentials: 'include',
          cache: 'no-store',
          signal: controller.signal,
        })

        if (resposta.status === 401) {
          navigate('/login', { replace: true })
          return
        }

        if (!resposta.ok) {
          throw new Error(
            'Não foi possível verificar sua sessão.'
          )
        }

        const sessao = await resposta.json()

        if (sessao.perfil === 'CLIENTE') {
          setCarregando(false)
          return
        }

        if (
          ['ADMIN', 'RESPONSAVEL', 'COLABORADOR'].includes(
            sessao.perfil
          )
        ) {
          navigate('/dashboard', { replace: true })
          return
        }

        throw new Error('Perfil de acesso não reconhecido.')
      } catch (error) {
        if (controller.signal.aborted) return

        setErro(
          error.message ||
            'Não foi possível conectar ao servidor.'
        )

        setCarregando(false)
      }
    }

    verificarSessao()

    return () => controller.abort()
  }, [navigate])

  const duvidas = [
    {
      pergunta: 'Como faço uma reclamação?',
      resposta:
        'Acesse "Nova reclamação", preencha as informações solicitadas e envie seu relato.',
    },
    {
      pergunta: 'Onde posso acompanhar minhas reclamações?',
      resposta:
        'Na seção "Minhas reclamações", você pode consultar os registros realizados e acompanhar seu andamento.',
    },
    {
      pergunta: 'Posso procurar uma reclamação existente?',
      resposta:
        'Sim! Utilize a opção "Procurar reclamação" para localizar registros disponíveis no sistema.',
    },
    {
      pergunta: 'Quem pode visualizar meus dados?',
      resposta:
        'As informações são acessadas conforme o perfil e as permissões de cada usuário.',
    },
    {
      pergunta: 'O que acontece após enviar uma reclamação?',
      resposta:
        'O registro ficará disponível para análise e acompanhamento pela equipe responsável.',
    },
  ]

  return (
    <main className="login-page cliente-page">
      <div className="cliente-layout">

        {/* Área do cliente */}
        <section
          className="cliente-area"
          aria-labelledby="cliente-title"
        >
          <header className="cliente-header">
            <span className="login-brand">
              ODRCON
            </span>

            <h1 id="cliente-title">
              Área do Cliente
            </h1>

            <p className="cliente-status">
              VOCÊ ESTÁ LOGADO
            </p>
          </header>

          {carregando ? (
            <p className="cliente-feedback" role="status">
              Verificando acesso...
            </p>
          ) : erro ? (
            <div className="cliente-feedback">
              <p className="login-error" role="alert">
                {erro}
              </p>

              <Link
                to="/login"
                className="cliente-button"
              >
                Voltar ao login
              </Link>
            </div>
          ) : (
            <>
              <p className="login-description cliente-description">
                Você está conectado à sua conta.
              </p>

              <nav
                className="cliente-navigation"
                aria-label="Navegação do cliente"
              >
                <Link
                  to="/cliente/minhas"
                  className="cliente-button"
                >
                  Minhas reclamações
                </Link>

                <Link
                  to="/procurar"
                  className="cliente-button"
                >
                  Procurar reclamação
                </Link>

                <Link
                  to="/cliente/nova"
                  className="cliente-button"
                >
                  Nova reclamação
                </Link>
              </nav>
            </>
          )}

          <footer className="cliente-footer">
            <Link
              to="/"
              className="cliente-home-link"
            >
              Página inicial
            </Link>

            <BotaoSair />
          </footer>
        </section>

        {/* Dúvidas frequentes */}
        <aside
          className="cliente-faq"
          aria-labelledby="faq-title"
        >
          <header className="cliente-faq-header">
            <h2 id="faq-title">
              Dúvidas frequentes
            </h2>

            <p>
              Saiba mais sobre a utilização da plataforma.
            </p>
          </header>

          <div className="cliente-faq-content">
            {duvidas.map((duvida, index) => (
              <article
                className="cliente-faq-item"
                key={index}
              >
                <h3>{duvida.pergunta}</h3>

                <p>{duvida.resposta}</p>
              </article>
            ))}
          </div>
        </aside>

      </div>
    </main>
  )
}
