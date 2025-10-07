import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api/evolution': {
        target: 'https://evola.latecnology.com.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/evolution/, ''),
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
        }
      },
      '/api/nps': {
        target: 'https://jrphwjkgepmgdgiqebyr.supabase.co/functions/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/nps/, '/nps'),
        secure: true,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
        }
      },

    }
  },
  plugins: [
    react(),
    // Temporarily disabled componentTagger to fix React.Fragment data-lov-id error
    // mode === 'development' &&
    // componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'LA Music RH - Sistema de Gestão de Recursos Humanos',
        short_name: 'LA Music RH',
        description: 'Sistema completo de gestão de recursos humanos para escolas de música. Gerencie funcionários, folha de pagamento, avaliações, benefícios e muito mais.',
        theme_color: '#1f2937',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/?utm_source=pwa',
        lang: 'pt-BR',
        dir: 'ltr',
        categories: ['business', 'productivity', 'education'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'apple-touch-icon.svg',
            sizes: '180x180',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Acesso rápido ao painel principal',
            url: '/dashboard',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Funcionários',
            short_name: 'Funcionários',
            description: 'Gerenciar funcionários',
            url: '/users',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Folha de Pagamento',
            short_name: 'Folha',
            description: 'Acessar folha de pagamento',
            url: '/payroll',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Avaliações',
            short_name: 'Avaliações',
            description: 'Sistema de avaliações',
            url: '/evaluations',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        screenshots: [
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Dashboard do LA Music RH'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Visão geral do sistema'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 8080,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'supabase-vendor';
            }
            if (id.includes('recharts')) {
              return 'chart-vendor';
            }
            if (id.includes('date-fns')) {
              return 'date-vendor';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
              return 'form-vendor';
            }
            return 'vendor';
          }
          
          // Feature chunks based on file paths
          if (id.includes('src/contexts/AuthContext') || id.includes('src/pages/AuthPage') || id.includes('src/pages/Login')) {
            return 'auth';
          }
          if (id.includes('src/pages/DashboardPage') || id.includes('src/components/dashboard')) {
            return 'dashboard';
          }
          if (id.includes('src/pages/BenefitsPage') || id.includes('src/components/benefits') || id.includes('src/services/benefitsService')) {
            return 'benefits';
          }
          if (id.includes('src/pages/PayrollPage') || id.includes('src/components/payroll') || id.includes('src/services/payrollService')) {
            return 'payroll';
          }
          if (id.includes('src/pages/ColaboradoresPage') || id.includes('src/components/colaboradores') || id.includes('src/services/employeeService')) {
            return 'employees';
          }
          if (id.includes('src/pages/EvaluationsPage') || id.includes('src/components/evaluations')) {
            return 'evaluations';
          }
          if (id.includes('src/pages/SchedulePage') || id.includes('src/components/schedule') || id.includes('src/services/scheduleService')) {
            return 'schedule';
          }
          if (id.includes('src/pages/DocumentsPage') || id.includes('src/components/documents') || id.includes('src/services/documentService')) {
            return 'documents';
          }
          if (id.includes('src/pages/NotificationsPage') || id.includes('src/components/notifications')) {
            return 'notifications';
          }
          if (id.includes('src/pages/SettingsPage') || id.includes('src/components/settings')) {
            return 'settings';
          }
          if (id.includes('src/pages/IncidentsPage') || id.includes('src/components/incidents') || id.includes('src/services/incidentService')) {
            return 'incidents';
          }
          if (id.includes('src/pages/NPSPage') || id.includes('src/components/nps') || id.includes('src/services/npsService')) {
            return 'nps';
          }
          if (id.includes('src/pages/VacationPage') || id.includes('src/components/vacation') || id.includes('src/services/vacationService')) {
            return 'vacation';
          }
          if (id.includes('src/pages/WhatsAppPage') || id.includes('src/components/whatsapp') || id.includes('src/services/whatsappService')) {
            return 'whatsapp';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));

// Note: For SPA routing to work properly in production,
// make sure your server is configured to serve index.html
// for all routes that don't match static files
