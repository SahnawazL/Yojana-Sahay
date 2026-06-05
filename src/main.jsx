import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import YojanaSahay from './App.jsx'
import AdminPage from './AdminPage.jsx'

// Route to AdminPage if the URL path starts with /admin
const isAdminRoute = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminPage /> : <YojanaSahay />}
  </StrictMode>
)
