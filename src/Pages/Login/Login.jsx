import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function entrar(event) {
    event.preventDefault()
    if (carregando) return

    setErro('')

    const idEmpresa = Number(empresa)

    if (!Number.isSafeInteger(idEmpresa) || idEmpresa <= 0) {
      setErro('Informe um código de empresa válido.')
      return
    }

    setCarregando(true)

    try {
      // Busca o token e recebe o cookie da sessão.
      const respostaCsrf = await fetch('/api/auth/csrf', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!respostaCsrf.ok) {
        throw new Error(
          'Não foi possível iniciar o login. Verifique se o backend está funcionando.'
        )
      }

      const csrf = await respostaCsrf.json()

      if (!csrf.headerName || !csrf.token) {
        throw new Error('O servidor retornou um token de segurança inválido.')
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
        throw new Error('A validação de segurança falhou. Tente entrar novamente.')
      }

      if (resposta.status === 400) {
        throw new Error('Confira os campos preenchidos.')
      }

      if (!resposta.ok) {
        throw new Error('Não foi possível entrar. Tente novamente mais tarde.')
      }

      // A autenticação fica no cookie de sessão, gerenciado pelo navegador.
      setSenha('')
      navigate('/dashboard', { replace: true })
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
          Entre para acompanhar e gerenciar manifestações.
        </p>

        <form onSubmit={entrar} aria-busy={carregando}>
          <label htmlFor="login-empresa">Código da empresa</label>
          <input
            id="login-empresa"
            type="number"
            min="1"
            step="1"
            placeholder="Ex.: 1"
            value={empresa}
            onChange={(event) => setEmpresa(event.target.value)}
            disabled={carregando}
            required
          />

          <label htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            autoComplete="username"
            placeholder="seuemail@empresa.com"
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
            placeholder="Digite sua senha"
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

          <button type="submit" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}