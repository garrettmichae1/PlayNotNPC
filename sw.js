const CACHE_NAME = 'playnotnpc-v1.0.0';
const STATIC_CACHE = 'playnotnpc-static-v1.0.0';
const DYNAMIC_CACHE = 'playnotnpc-dynamic-v1.0.0';

// Files to cache immediately (app shell)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/planner.html',
  '/analytics.html',
  '/achievements.html',
  '/friends.html',
  '/login.html',
  '/styles.css',
  '/planner.css',
  '/analytics.css',
  '/achievements.css',
  '/friends.css',
  '/login.css',
  '/app.js',
  '/planner.js',
  '/analytics.js',
  '/achievements.js',
  '/friends.js',
  '/login.js',
  '/chart.js',
  '/modules/auth.js',
  '/modules/tracker.js',
  '/modules/xpManager.js',
  '/modules/storage.js',
  '/modules/activityManager.js',
  '/modules/achievements.js',
  '/modules/mobileNav.js',
  '/modules/mobileOptimizations.js',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle static files
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          console.log('📦 Serving from cache:', request.url);
          return response;
        }

        console.log('🌐 Fetching from network:', request.url);
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response && response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            return new Response('Offline content not available', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for API requests
    const response = await fetch(request);
    
    if (response.ok) {
      // Cache successful API responses
      const responseClone = response.clone();
      const cache = await caches.open(DYNAMIC_CACHE);
      
      // Only cache GET requests and specific endpoints
      if (request.method === 'GET' && (
        url.pathname.includes('/activities') ||
        url.pathname.includes('/achievements') ||
        url.pathname.includes('/stats') ||
        url.pathname.includes('/user')
      )) {
        cache.put(request, responseClone);
      }
      
      return response;
    }
    
    throw new Error('API request failed');
  } catch (error) {
    console.log('📦 API request failed, trying cache:', request.url);
    
    // Try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Serving API response from cache:', request.url);
      return cachedResponse;
    }
    
    // Return error response
    return new Response(JSON.stringify({
      error: 'Offline mode - data not available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('🔔 Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New activity reminder!',
    icon: '/manifest.json',
    badge: '/manifest.json',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/manifest.json'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/manifest.json'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PlayNotNPC', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for offline activities
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(syncOfflineActivities());
  }
});

// Sync offline activities when connection is restored
async function syncOfflineActivities() {
  try {
    const offlineActivities = await getOfflineActivities();
    
    if (offlineActivities.length > 0) {
      console.log('🔄 Syncing offline activities:', offlineActivities.length);
      
      for (const activity of offlineActivities) {
        try {
          const response = await fetch('/api/activities', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${activity.token}`
            },
            body: JSON.stringify(activity.data)
          });
          
          if (response.ok) {
            console.log('✅ Synced activity:', activity.id);
            await removeOfflineActivity(activity.id);
          }
        } catch (error) {
          console.error('❌ Failed to sync activity:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Helper functions for offline storage
async function getOfflineActivities() {
  try {
    const result = await indexedDB.open('PlayNotNPC', 1);
    const db = await new Promise((resolve, reject) => {
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    });
    
    const transaction = db.transaction(['offlineActivities'], 'readonly');
    const store = transaction.objectStore('offlineActivities');
    const activities = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    return activities;
  } catch (error) {
    console.error('❌ Failed to get offline activities:', error);
    return [];
  }
}

async function removeOfflineActivity(id) {
  try {
    const result = await indexedDB.open('PlayNotNPC', 1);
    const db = await new Promise((resolve, reject) => {
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    });
    
    const transaction = db.transaction(['offlineActivities'], 'readwrite');
    const store = transaction.objectStore('offlineActivities');
    await new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('❌ Failed to remove offline activity:', error);
  }
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  console.log('📨 Message received in service worker:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('🔧 Service Worker script loaded'); 