import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import apiGerarPlanoHandler from './api/gerar-plano.js'
import apiPacientesHandler from './api/pacientes.js'
import apiConsultasHandler from './api/consultas.js'

/**
 * Mapeia rotas de API para seus handlers serverless
 */
const API_ROUTES = {
  '/api/gerar-plano': apiGerarPlanoHandler,
  '/api/pacientes': apiPacientesHandler,
  '/api/consultas': apiConsultasHandler,
};

// Plugin local para rodar Serverless Functions em modo dev
function devApiPlugin() {
  return {
    name: 'vite-dev-api-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Determinar qual handler usar baseado na URL
        const matchedRoute = Object.keys(API_ROUTES).find(route => req.url && req.url.startsWith(route));
        
        if (!matchedRoute) {
          return next();
        }

        const handler = API_ROUTES[matchedRoute];
        const env = loadEnv(server.config.mode, process.cwd(), '');
        
        // Injetar variáveis de ambiente
        process.env.GOOGLE_API_KEY = env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
        process.env.DATABASE_URL = env.DATABASE_URL || process.env.DATABASE_URL;

        // Ler body da requisição
        let bodyData = '';
        req.on('data', chunk => {
          bodyData += chunk;
        });

        req.on('end', async () => {
          try {
            req.body = bodyData ? JSON.parse(bodyData) : {};
          } catch {
            req.body = {};
          }

          // Adaptador para compatibilidade com o handler Express/Vercel
          res.status = function (code) {
            res.statusCode = code;
            return res;
          };
          res.json = function (obj) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(obj));
            return res;
          };

          try {
            await handler(req, res);
          } catch (err) {
            console.error(`Erro no handler da API dev (${matchedRoute}):`, err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  process.env.GOOGLE_API_KEY = env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

  return {
    plugins: [
      react(),
      devApiPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-192x192.svg',
          'pwa-512x512.svg'
        ],
        manifest: {
          name: 'VIVA NUTRI — Gestão & Inteligência Clínica',
          short_name: 'VIVA NUTRI',
          description: 'Plataforma de Gestão Nutricional e Inteligência Clínica',
          theme_color: '#7C3AED',
          background_color: '#090D16',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/pwa-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any'
            },
            {
              src: '/pwa-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ]
        },
        devOptions: {
          enabled: true
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    server: {
      host: true,
      port: 5173,
    },
  };
})
