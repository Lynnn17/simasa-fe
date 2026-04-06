// Firebase Messaging Service Worker Placeholder
// This file prevents 404 errors when Firebase is not configured

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (event) {
    // Handle push notifications here when Firebase is configured
    console.log('Push notification received');
});
