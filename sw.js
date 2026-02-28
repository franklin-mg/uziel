/**
 * Service Worker para GameUziel - Versión 2
 * Estrategia: Offline-First (Cache First, then Network)
 */

const CACHE_NAME = 'gameuziel-cache-v2';
const ASSETS_TO_CACHE = [
    './',
    './gameuziel.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Rubik:wght@700;900&display=swap',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js'
];

// Evento de Instalación: Cachea los recursos esenciales
self.addEventListener('install', (event) => {
    // Forzamos al SW a convertirse en el SW activo actual
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Instalando v2: Almacenando recursos en caché');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Evento de Activación: Gestión de memoria y limpieza de versiones antiguas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Si el nombre de la caché en memoria no coincide con la v2, la eliminamos
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché antigua detectada:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Versión 2 lista para usar. Controlando clientes...');
            // Toma el control de todas las pestañas abiertas inmediatamente
            return self.clients.claim();
        })
    );
});

// Evento Fetch: Estrategia Offline-First (Cache First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // 1. Devolvemos el recurso de la caché si existe (Offline mode)
            if (response) {
                return response;
            }

            // 2. Si no está en caché, intentamos obtenerlo de la red (Online mode)
            return fetch(event.request).then((networkResponse) => {
                // Opcional: Podríamos cachear dinámicamente nuevos recursos aquí
                return networkResponse;
            }).catch(() => {
                // Si ambos fallan (no hay red ni caché), podrías devolver una página de error
                console.error('[SW] Recurso no disponible en caché ni red:', event.request.url);
            });
        })
    );
});
