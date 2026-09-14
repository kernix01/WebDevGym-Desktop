const CACHE_NAME = 'webdevgym-shell-2026-09-14-v136';
const APP_SHELL = [
  './index.html',
  './index-en.html',
  './favicon.svg',
  './manifest.webmanifest',
  './css/modern-language-fixes.css',
  './css/webdevgym-base-ru.css',
  './css/webdevgym-base-en.css',
  './css/modern-ui.css',
  './css/modern-ui-fixes.css',
  './css/modern-ui-v2.css',
  './css/modern-ui-v3.css',
  './css/modern-ui-v5.css',
  './css/webdevgym-features.css',
  './css/webdevgym-naming.css?v=20260906-1',
  './css/webdevgym-lab.css',
  './css/webdevgym-api-lab.css',
  './css/webdevgym-trainers-v2.css',
  './css/webdevgym-personalization.css',
  './css/webdevgym-custom-sounds.css',
  './css/webdevgym-forge.css',
  './css/webdevgym-forge-v2.css',
  './css/webdevgym-project-path.css?v=20260803-1',
  './css/webdevgym-studio-suite.css',
  './css/webdevgym-today.css',
  './css/webdevgym-today-v2.css',
  './css/webdevgym-growth.css',
  './css/webdevgym-routes-v2.css',
  './css/webdevgym-nexus.css',
  './css/webdevgym-mobile.css',
  './css/webdevgym-ai-settings.css',
  './css/webdevgym-settings-v2.css?v=20260913-3',
  './css/webdevgym-splash.css',
  './css/webdevgym-github-token-vault.css',
  './css/webdevgym-github-workspace.css',
  './css/curriculum-depth-2026.css',
  './css/webdevgym-profile-redesign.css',
  './css/webdevgym-next.css?v=20260913-2',
  './css/webdevgym-calendar-v5.css',
  './css/webdevgym-nexus-v3.css?v=20260911-2',
  './css/webdevgym-learning-workspace.css',
  './css/webdevgym-playground-atlas.css?v=20260907-2',
  './css/webdevgym-usability.css',
  './css/webdevgym-project-mode.css',
  './css/webdevgym-notebook.css',
  './css/webdevgym-mastery.css',
  './css/webdevgym-context-menu.css',
  './css/webdevgym-comfort.css?v=20260913-5',
  './css/webdevgym-local-first.css?v=20260906-1',
  './data/curriculum-ru.js',
  './data/curriculum-en.js',
  './data/curriculum-languages-2026.js?v=20260913-2',
  './data/curriculum-depth-2026.js',
  './data/curriculum-audit-2026.js',
  './data/curriculum-corrections-2026.js',
  './data/curriculum-order-2026.js',
  './js/webdevgym-curriculum-renderer.js',
  './js/modern-language-bootstrap-v2.js',
  './js/webdevgym-core-ru.js?v=20260913-5',
  './js/webdevgym-core-en.js?v=20260913-5',
  './js/modern-ui-bootstrap.js',
  './js/modern-ui.js?v=20260913-3',
  './js/modern-ui-v2.js',
  './js/modern-ui-v3.js',
  './js/modern-ui-v4.js',
  './js/modern-ui-v5.js',
  './js/modern-ui-v6.js',
  './js/webdevgym-shared-runtime.js',
  './js/webdevgym-features.js?v=20260913-6',
  './js/webdevgym-profile-redesign.js',
  './js/webdevgym-today.js',
  './js/webdevgym-today-v2.js?v=20260913-5',
  './js/webdevgym-learning.js?v=20260913-7',
  './js/webdevgym-growth.js?v=20260914-8',
  './js/webdevgym-lab.js',
  './js/webdevgym-api-lab.js',
  './js/webdevgym-trainers-v2.js',
  './js/webdevgym-critical-boot.js?v=20260824-2',
  './js/webdevgym-personalization.js?v=20260824-2',
  './js/webdevgym-custom-sounds.js',
  './js/webdevgym-forge.js',
  './js/webdevgym-forge-v2.js?v=20260906-1',
  './js/webdevgym-pwa.js?v=20260913-4',
  './js/webdevgym-mobile.js',
  './js/webdevgym-ai-settings.js?v=20260824-4',
  './js/webdevgym-settings-v2.js?v=20260803-1',
  './js/webdevgym-github-token-vault.js',
  './js/webdevgym-github-folder.js?v=20260906-2',
  './js/webdevgym-studio-suite.js',
  './js/webdevgym-github-workspace.js?v=20260907-1',
  './js/webdevgym-mobile-performance.js',
  './js/webdevgym-next.js?v=20260913-8',
  './js/webdevgym-naming-engine.js?v=20260906-1',
  './js/webdevgym-naming.js?v=20260906-1',
  './js/webdevgym-calendar-v5.js',
  './js/webdevgym-nexus-v3.js?v=20260911-2',
  './js/webdevgym-learning-workspace.js?v=20260913-3',
  './js/vendor/emmet-browser.min.js?v=2.4.11',
  './js/webdevgym-playground-atlas.js?v=20260913-4',
  './js/webdevgym-usability.js',
  './js/webdevgym-project-mode.js',
  './js/webdevgym-notebook.js?v=20260911-2',
  './js/webdevgym-mastery.js?v=20260913-2',
  './js/webdevgym-context-menu.js',
  './js/webdevgym-optimizer.js?v=20260906-1',
  './js/webdevgym-transitions.js?v=20260913-5',
  './js/webdevgym-local-first.js?v=20260906-1'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith('webdevgym-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type !== 'WEBDEVGYM_OPTIMIZE') return;
  const task = caches.keys()
    .then(keys => Promise.all(keys
      .filter(key => key.startsWith('webdevgym-shell-') && key !== CACHE_NAME)
      .map(key => caches.delete(key).then(deleted => Number(deleted)))))
    .then(results => ({ deleted: results.reduce((total, value) => total + value, 0), updated: true }))
    .catch(() => ({ deleted: 0, updated: false }));
  event.waitUntil(task);
  task.then(result => event.ports?.[0]?.postMessage(result));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.destination === 'script' || request.destination === 'style') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }


  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(response => response || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      });
    })
  );
});
