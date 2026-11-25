import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import App from './App.jsx'
import ReclamacaoForm from './Pages/ReclamacaoForm/ReclamacaoForm.jsx'
import Dashboard from './Pages/Dashboard/Dashboard.jsx'
import Login from './Pages/Login/Login.jsx'
import Cadastro from './Pages/Cadastro/Cadastro.jsx'
import Cliente from './Pages/Cliente/Cliente.jsx'
import RevisaoIA from './Pages/RevisaoIA/RevisaoIA.jsx'
import MinhasReclamacoes from './Pages/MinhasReclamacoes/MinhasReclamacoes.jsx'
import Procurar from './Pages/ProcurarReclamacao/ProcurarReclamacao.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
  { path: '/reclamacao', element: <ReclamacaoForm /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/cliente', element: <Cliente /> },
  { path: '/revisao-ia', element: <RevisaoIA /> },
  { path: '/cliente/minhas', element: <MinhasReclamacoes /> },
  { path: '/cliente/nova', element: <ReclamacaoForm /> },
  { path: '/procurar', element: <Procurar /> }
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
