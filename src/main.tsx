
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/mobile-responsive.css'
import { CronJobService } from './services/cronJobService'

// Inicializar cron jobs apenas em produção
if (import.meta.env.PROD) {
  // Cron jobs do frontend inicializados
} else {
  // Cron jobs do frontend desabilitados - usando pg_cron do banco
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
