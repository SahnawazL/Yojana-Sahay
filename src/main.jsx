import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import YojanaSahay from './App.jsx'
import AdminPage from './AdminPage.jsx'
import EmbedChecker from './EmbedChecker.jsx'

// Route to AdminPage if the URL path starts with /admin
const isAdminRoute = window.location.pathname.startsWith('/admin');
// Route to the standalone embeddable eligibility checker at /embed
// (used for the iframe embed on the portfolio site)
const isEmbedRoute = window.location.pathname.startsWith('/embed');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminPage /> : isEmbedRoute ? <EmbedChecker /> : <YojanaSahay />}
  </StrictMode>
)
