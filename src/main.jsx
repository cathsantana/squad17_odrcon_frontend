import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// BIBLIOTECA PARA ROTEAMENTO
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// IMPORTS DE COMPONENTES
import App from './App.jsx'
import ReclamacaoForm from './Pages/ReclamacaoForm/ReclamacaoForm.jsx'
import Dashboard from './Pages/Dashboard/Dashboard.jsx'

// ROTEAMENTOS
const router = createBrowserRouter([
  {path:'/', element:<App/>},
  {path:'/reclamacao', element:<ReclamacaoForm/>},
  {path:'/dashboard', element:<Dashboard/>}

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
