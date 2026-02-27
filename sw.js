/**
 * Service Worker para RainLearn - Lucia
 * Maneja el funcionamiento Offline y la limpieza de caché antigua.
 */

const CACHE_NAME = 'game-lucia-v1'; // Incrementa esto (v2, v3...) al actualizar el código
const ASSETS = [
    './',
    './index.html',
    'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Rubik:wght@900&display=swap'
];

// Instalación: Cachear archivos esenciales
self.addEventListener('install', (event) => {
    // Forzar que el nuevo SW tome el control de inmediato
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activación: Borrar caché previa si existe una versión antigua instalada
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Si el nombre del caché no coincide con la versión actual, se borra
                    if (cacheName !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Reclamar el control de los clientes inmediatamente
            return self.clients.claim();
        })
    );
});

// Estrategia de Fetch: Intentar red primero, si falla usar caché (Network First)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});