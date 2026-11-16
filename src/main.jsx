import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './tokens/index.css'
import './css/base.css'
import './css/components.css'
import './docs/docs.css'
import App from './docs/App.jsx'

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
