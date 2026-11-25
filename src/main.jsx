import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import './index.css'

import App from './App.jsx'
import ReclamacaoForm from './Pages/ReclamacaoForm/ReclamacaoForm.jsx'
import Dashboard from './Pages/Dashboard/Dashboard.jsx'
import Login from './Pages/Login/Login.jsx'
import Cadastro from './Pages/Cadastro/Cadastro.jsx'
import Cliente from './Pages/Cliente/Cliente.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/login', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
  { path: '/reclamacao', element: <ReclamacaoForm /> },
  { path: '/dashboard', element: <Dashboard /> },
  { path: '/cliente', element: <Cliente /> },
  { path: '/revisao-ia', element: <Navigate to="/reclamacao" replace /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
