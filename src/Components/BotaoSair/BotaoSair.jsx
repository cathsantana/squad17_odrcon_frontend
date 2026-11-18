import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './BotaoSair.css'

export default function BotaoSair() {
  const navigate = useNavigate()
  const [saindo, setSaindo] = useState(false)
  const [erro, setErro] = useState('')

  async function sair() {
    if (saindo) return

    setSaindo(true)
    setErro('')

    try {
      const respostaCsrf = await fetch('/api/auth/csrf', {
        credentials: 'include',
        cache: 'no-store',
      })

      if (!respostaCsrf.ok) {
        throw new Error('Não foi possível iniciar a saída.')
      }

      const csrf = await respostaCsrf.json()

      if (!csrf.headerName || !csrf.token) {
        throw new Error('O servidor retornou um token inválido.')
      }

      const resposta = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          [csrf.headerName]: csrf.token,
        },
      })

      if (!resposta.ok) {
        throw new Error('Não foi possível sair. Tente novamente.')
      }

      navigate('/login', { replace: true })
    } catch (error) {
      setErro(
        error instanceof TypeError
          ? 'Não foi possível conectar ao servidor. Tente sair novamente.'
          : error.message || 'Não foi possível encerrar a sessão.'
      )
    } finally {
      setSaindo(false)
    }
  }

  return (
    <div className="logout-area">
      <button
        className="logout-button"
        type="button"
        onClick={sair}
        disabled={saindo}
      >
        {saindo ? 'Saindo...' : 'Sair'}
      </button>

      {erro && (
        <p className="logout-error" role="alert">
          {erro}
        </p>
      )}
    </div>
  )
}