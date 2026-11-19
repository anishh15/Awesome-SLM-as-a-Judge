import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import '@fontsource-variable/inter/opsz.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/components.css'
import './styles/layout.css'
import './styles/pages.css'
import './styles/motion.css'
import './styles/hero-scene.css'
import './styles/viz-insights.css'
import './styles/viz-corpus.css'
import { ThemeProvider } from './lib/theme.jsx'
import { routes } from './routes.jsx'

document.documentElement.classList.add('js')

const router = createHashRouter(routes)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
