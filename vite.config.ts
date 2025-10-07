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
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select', '@radix-ui/react-toast'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'chart-vendor': ['recharts'],
          'date-vendor': ['date-fns'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Feature chunks
          'auth': ['src/contexts/AuthContext.tsx', 'src/pages/AuthPage.tsx', 'src/pages/Login.tsx'],
          'dashboard': ['src/pages/DashboardPage.tsx', 'src/components/dashboard'],
          'benefits': ['src/pages/BenefitsPage.tsx', 'src/components/benefits', 'src/services/benefitsService.ts'],
          'payroll': ['src/pages/PayrollPage.tsx', 'src/components/payroll', 'src/services/payrollService.ts'],
          'employees': ['src/pages/ColaboradoresPage.tsx', 'src/components/colaboradores', 'src/services/employeeService.ts'],
          'evaluations': ['src/pages/EvaluationsPage.tsx', 'src/components/evaluations'],
          'schedule': ['src/pages/SchedulePage.tsx', 'src/components/schedule', 'src/services/scheduleService.ts'],
          'documents': ['src/pages/DocumentsPage.tsx', 'src/components/documents', 'src/services/documentService.ts'],
          'notifications': ['src/pages/NotificationsPage.tsx', 'src/components/notifications'],
          'settings': ['src/pages/SettingsPage.tsx', 'src/components/settings'],
          'incidents': ['src/pages/IncidentsPage.tsx', 'src/components/incidents', 'src/services/incidentService.ts'],
          'nps': ['src/pages/NPSPage.tsx', 'src/components/nps', 'src/services/npsService.ts'],
          'vacation': ['src/pages/VacationPage.tsx', 'src/components/vacation', 'src/services/vacationService.ts'],
          'whatsapp': ['src/pages/WhatsAppPage.tsx', 'src/components/whatsapp', 'src/services/whatsappService.ts']
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));

// Note: For SPA routing to work properly in production,
// make sure your server is configured to serve index.html
// for all routes that don't match static files
