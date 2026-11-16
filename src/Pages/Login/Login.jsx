import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()

  const [empresas, setEmpresas] = useState([])
  const [buscandoEmpresas, setBuscandoEmpresas] = useState(true)
  const [erroEmpresas, setErroEmpresas] = useState('')

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function carregarEmpresas() {
      try {
        const resposta = await fetch('/api/empresas/publicas', {
          credentials: 'include',
          signal: controller.signal,
        })

        if (!resposta.ok) {
          throw new Error('Não foi possível carregar as empresas.')
        }

        const dados = await resposta.json()

        if (!Array.isArray(dados)) {
          throw new Error('A lista de empresas está em formato inválido.')
        }

        setEmpresas(dados)
      } catch (error) {
        if (controller.signal.aborted) return

        setErroEmpresas(
          error.message || 'Não foi possível carregar as empresas.'
        )
      } finally {
        if (!controller.signal.aborted) {
          setBuscandoEmpresas(false)
        }
      }
    }

    carregarEmpresas()

    return () => controller.abort()
  }, [])

  async function entrar(event) {
    event.preventDefault()
    if (carregando) return

    setErro('')

    const idEmpresa = Number(empresa)

    if (!Number.isSafeInteger(idEmpresa) || idEmpresa <= 0) {
      setErro('Selecione uma empresa.')
      return
    }

    setCarregando(true)

    try {
      const respostaCsrf = await fetch('/api/auth/csrf', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!respostaCsrf.ok) {
        throw new Error('Não foi possível iniciar o login.')
      }

      const csrf = await respostaCsrf.json()

      if (!csrf.headerName || !csrf.token) {
        throw new Error('O servidor retornou um token inválido.')
      }

      const resposta = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          email: email.trim(),
          senha,
          idEmpresa,
        }),
      })

      if (resposta.status === 401) {
        throw new Error('E-mail, senha ou empresa incorretos.')
      }

      if (resposta.status === 403) {
        throw new Error('A validação de segurança falhou. Tente novamente.')
      }

      if (resposta.status === 400) {
        throw new Error('Confira os campos preenchidos.')
      }

      if (!resposta.ok) {
        throw new Error('Não foi possível entrar. Tente novamente.')
      }

      setSenha('')

      // Consulta o perfil usando a sessão confirmada pelo backend.
      const respostaSessao = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!respostaSessao.ok) {
        throw new Error('Não foi possível confirmar sua sessão.')
      }

      const sessao = await respostaSessao.json()

      if (sessao.perfil === 'CLIENTE') {
        navigate('/cliente', { replace: true })
      } else if (
        ['ADMIN', 'RESPONSAVEL', 'COLABORADOR'].includes(sessao.perfil)
      ) {
        navigate('/dashboard', { replace: true })
      } else {
        throw new Error('Seu perfil não possui um acesso configurado.')
      }
    } catch (error) {
      setErro(
        error instanceof TypeError
          ? 'Não foi possível conectar ao servidor.'
          : error.message || 'Ocorreu um erro ao entrar.'
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="login-title">
        <span className="login-brand">ODRCON</span>

        <h1 id="login-title">Acesse sua conta</h1>
        <p className="login-description">
          Selecione sua empresa e informe seus dados de acesso.
        </p>

        <form onSubmit={entrar} aria-busy={carregando}>
          <label htmlFor="login-empresa">Empresa</label>
          <select
            id="login-empresa"
            value={empresa}
            onChange={(event) => setEmpresa(event.target.value)}
            disabled={
              carregando ||
              buscandoEmpresas ||
              Boolean(erroEmpresas) ||
              empresas.length === 0
            }
            required
          >
            <option value="">
              {buscandoEmpresas
                ? 'Carregando empresas...'
                : 'Selecione uma empresa'}
            </option>

            {empresas.map((item) => (
              <option key={item.idEmpresa} value={item.idEmpresa}>
                {item.nomeEmpresa}
              </option>
            ))}
          </select>

          {erroEmpresas && (
            <p className="login-error" role="alert">
              {erroEmpresas} Atualize a página para tentar novamente.
            </p>
          )}

          {!buscandoEmpresas &&
            !erroEmpresas &&
            empresas.length === 0 && (
              <p role="status">Não há empresas disponíveis.</p>
            )}

          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            maxLength={255}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={carregando}
            required
          />

          <label htmlFor="login-senha">Senha</label>
          <input
            id="login-senha"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(event) => setSenha(event.target.value)}
            disabled={carregando}
            required
          />

          {erro && (
            <p className="login-error" role="alert">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={
              carregando ||
              buscandoEmpresas ||
              Boolean(erroEmpresas) ||
              empresas.length === 0
            }
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="login-public-access">
          <p>
            Ainda não tem conta?{' '}
            <Link to="/cadastro">Criar conta</Link>
          </p>
          <p>Quer registrar uma denúncia anônima?</p>
          <Link to="/reclamacao">Continue sem fazer login</Link>
          <p>Selecione a opção anônima no formulário.</p>
        </div>
      </section>
    </main>
  )
}