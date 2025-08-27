import { createRoot } from 'react-dom/client'
import './index.css'

import { StrictMode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App.tsx'
import { updateFavicon } from './lib/themes.ts'

updateFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster richColors position="top-right" />
    </BrowserRouter>
  </StrictMode>,
)
