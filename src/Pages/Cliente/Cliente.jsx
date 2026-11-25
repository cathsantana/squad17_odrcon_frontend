import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../Login/Login.css'
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
          throw new Error('Não foi possível verificar sua sessão.')
        }

        const sessao = await resposta.json()

        if (sessao.perfil === 'CLIENTE') {
          setCarregando(false)
          return
        }

        if (
          ['ADMIN', 'RESPONSAVEL', 'COLABORADOR'].includes(sessao.perfil)
        ) {
          navigate('/dashboard', { replace: true })
          return
        }

        throw new Error('Perfil de acesso não reconhecido.')
      } catch (error) {
        if (controller.signal.aborted) return

        setErro(error.message || 'Não foi possível conectar ao servidor.')
        setCarregando(false)
      }
    }

    verificarSessao()

    return () => controller.abort()
  }, [navigate])

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="cliente-title">
        <span className="login-brand">ODRCON</span>
        <h1 id="cliente-title">Área do cliente</h1>

        {carregando ? (
          <p role="status">Verificando acesso...</p>
        ) : erro ? (
          <>
            <p className="login-error" role="alert">{erro}</p>
            <div className="login-public-access">
              <Link to="/login">Voltar ao login</Link>
            </div>
          </>
        ) : (
          <>
            <p className="login-description">
              Você está conectado à sua conta.
            </p>
           <nav className="login-public-access">
              <Link to="/cliente/minhas">Minhas reclamações</Link>
              <Link to="/procurar">Procurar reclamação</Link>
              <Link to="/cliente/nova">Fazer reclamação</Link>
           </nav>
            <div className="login-public-access">
  <Link to="/">Página inicial</Link>
  <BotaoSair />
</div>
          </>
        )}
      </section>
    </main>
  )
}