import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tokens/index.css'
import './css/base.css'
import './css/components.css'
import './docs/docs.css'
import App from './docs/App.jsx'

// Modo claro por defecto; el switch del encabezado permite pasar a oscuro.
document.documentElement.dataset.theme = 'light'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
