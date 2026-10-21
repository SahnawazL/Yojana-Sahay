import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import YojanaSahay from './App.jsx'
import AdminPage from './AdminPage.jsx'
import EmbedChecker from './EmbedChecker.jsx'
import { trackVisit } from './track.js'

// Route to AdminPage if the URL path starts with /admin
const isAdminRoute = window.location.pathname.startsWith('/admin');
// Route to the standalone embeddable eligibility checker at /embed
// (used for the iframe embed on the portfolio site)
const isEmbedRoute = window.location.pathname.startsWith('/embed');

// Count today's visit (anonymous, once per device per day) — not for /admin or /embed.
if (!isAdminRoute && !isEmbedRoute) trackVisit()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminPage /> : isEmbedRoute ? <EmbedChecker /> : <YojanaSahay />}
  </StrictMode>
)
