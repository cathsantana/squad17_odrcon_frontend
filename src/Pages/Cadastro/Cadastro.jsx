import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import '../Login/Login.css'

export default function Cadastro() {
  const [empresas, setEmpresas] = useState([])
  const [buscandoEmpresas, setBuscandoEmpresas] = useState(true)
  const [erroEmpresas, setErroEmpresas] = useState('')

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')

  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

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
          throw new Error('A lista de empresas retornou em formato inválido.')
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

  async function cadastrar(event) {
    event.preventDefault()
    if (carregando) return

    setErro('')

    const idEmpresa = Number(empresa)

    if (!nome.trim()) {
      setErro('Informe seu nome.')
      return
    }

    if (!Number.isSafeInteger(idEmpresa) || idEmpresa <= 0) {
      setErro('Selecione uma empresa.')
      return
    }

    if (senha !== confirmacao) {
      setErro('As senhas não coincidem.')
      return
    }

    if (!senha.trim() || senha.length < 8) {
      setErro('Informe uma senha com pelo menos 8 caracteres.')
      return
    }

    if (new TextEncoder().encode(senha).length > 72) {
      setErro('A senha é muito longa. Reduza a quantidade de caracteres.')
      return
    }

    setCarregando(true)

    try {
      const respostaCsrf = await fetch('/api/auth/csrf', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!respostaCsrf.ok) {
        throw new Error('Não foi possível iniciar o cadastro.')
      }

      const csrf = await respostaCsrf.json()

      if (!csrf.headerName || !csrf.token) {
        throw new Error('O servidor retornou um token de segurança inválido.')
      }

      const resposta = await fetch('/api/auth/registro', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          [csrf.headerName]: csrf.token,
        },
        body: JSON.stringify({
          nome: nome.trim(),
          email: email.trim(),
          senha,
          idEmpresa,
        }),
      })

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null)

        const mensagem =
          dados?.erro ||
          (resposta.status === 403
            ? 'A validação de segurança falhou. Tente novamente.'
            : 'Não foi possível concluir o cadastro.')

        throw new Error(mensagem)
      }

      setSenha('')
      setConfirmacao('')
      setSucesso(true)
    } catch (error) {
      setErro(
        error instanceof TypeError
          ? 'Não foi possível conectar ao servidor.'
          : error.message || 'Ocorreu um erro no cadastro.'
      )
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-labelledby="cadastro-title">
        <span className="login-brand">ODRCON</span>

        <h1 id="cadastro-title">
          {sucesso ? 'Conta criada' : 'Criar conta'}
        </h1>

        {sucesso ? (
          <>
            <p className="login-description" role="status">
              Seu cadastro foi realizado com sucesso.
            </p>

            <div className="login-public-access">
              <Link to="/login">Ir para o login</Link>
            </div>
          </>
        ) : (
          <>
            <p className="login-description">
              Preencha seus dados e selecione a empresa.
            </p>

            <form onSubmit={cadastrar} aria-busy={carregando}>
              <label htmlFor="cadastro-nome">Nome completo</label>
              <input
                id="cadastro-nome"
                type="text"
                autoComplete="name"
                maxLength={150}
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                disabled={carregando}
                required
              />

              <label htmlFor="cadastro-email">E-mail</label>
              <input
                id="cadastro-email"
                type="email"
                autoComplete="email"
                maxLength={255}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={carregando}
                required
              />

              <label htmlFor="cadastro-empresa">Empresa</label>
              <select
                id="cadastro-empresa"
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
                  <p role="status">
                    Não há empresas disponíveis para cadastro.
                  </p>
                )}

              <label htmlFor="cadastro-senha">Senha</label>
              <input
                id="cadastro-senha"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                placeholder="Pelo menos 8 caracteres"
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                disabled={carregando}
                required
              />

              <label htmlFor="cadastro-confirmacao">
                Confirmar senha
              </label>
              <input
                id="cadastro-confirmacao"
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={confirmacao}
                onChange={(event) => setConfirmacao(event.target.value)}
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
                {carregando ? 'Cadastrando...' : 'Criar conta'}
              </button>
            </form>

            <div className="login-public-access">
              <p>
                Já tem uma conta? <Link to="/login">Fazer login</Link>
              </p>
              <Link to="/reclamacao">
                Registrar denúncia sem fazer login
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  )
}