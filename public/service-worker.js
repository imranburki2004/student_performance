/**
 * Offline-First Service Worker
 * Student Performance & Attendance Analytics Platform
 * Caches core HTML, CSS, JS, and CSV data for 100% offline standalone execution.
 */

const CACHE_NAME = 'student-analytics-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/components.css',
  './css/layout.css',
  './css/dashboard.css',
  './css/thesis.css',
  './css/print.css',
  './js/chart.min.js',
  './js/initialData.js',
  './js/uciData.js',
  './js/thesisApp.js',
  './js/uciAnalytics.js',
  './js/advancedAnalytics.js',
  './js/aiAssistant.js',
  './js/dataManagement.js',
  './js/attendance.js',
  './js/repository.js',
  './js/permissions.js',
  './js/auth.js',
  './data/students.csv',
  './data/attendance.csv',
  './data/uci_dropout_data.csv'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Non-blocking cache load notice:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Offline-first strategy: Return cached asset if available, else fetch from network
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request).catch(() => {
        return caches.match('./index.html');
      });
    })
  );
});
