// PWA Module - Handles Progressive Web App features
export class PWA {
    constructor() {
        this.registration = null;
        this.isOnline = navigator.onLine;
        this.init();
    }

    async init() {
        console.log('🔧 Initializing PWA features...');
        
        // Register service worker
        await this.registerServiceWorker();
        
        // Set up online/offline detection
        this.setupOnlineDetection();
        
        // Request notification permission
        await this.requestNotificationPermission();
        
        // Set up offline storage
        this.setupOfflineStorage();
        
        console.log('✅ PWA features initialized');
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                this.registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered:', this.registration);
                
                // Handle updates
                this.registration.addEventListener('updatefound', () => {
                    const newWorker = this.registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        }
    }

    setupOnlineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.onOnline();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.onOffline();
        });
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            console.log('🔔 Notification permission:', permission);
            return permission === 'granted';
        }
        return false;
    }

    setupOfflineStorage() {
        // Initialize IndexedDB for offline storage
        if ('indexedDB' in window) {
            const request = indexedDB.open('PlayNotNPC', 1);
            
            request.onerror = () => {
                console.error('❌ IndexedDB error:', request.error);
            };
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB initialized');
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('offlineActivities')) {
                    const store = db.createObjectStore('offlineActivities', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('userData')) {
                    const store = db.createObjectStore('userData', { keyPath: 'key' });
                }
            };
        }
    }

    async storeOfflineActivity(activityData) {
        if (!this.db) return false;
        
        try {
            const transaction = this.db.transaction(['offlineActivities'], 'readwrite');
            const store = transaction.objectStore('offlineActivities');
            
            const offlineActivity = {
                data: activityData,
                timestamp: Date.now(),
                token: localStorage.getItem('token')
            };
            
            await new Promise((resolve, reject) => {
                const request = store.add(offlineActivity);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
            
            console.log('💾 Activity stored offline:', activityData);
            return true;
        } catch (error) {
            console.error('❌ Failed to store offline activity:', error);
            return false;
        }
    }

    async getOfflineActivities() {
        if (!this.db) return [];
        
        try {
            const transaction = this.db.transaction(['offlineActivities'], 'readonly');
            const store = transaction.objectStore('offlineActivities');
            
            return await new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('❌ Failed to get offline activities:', error);
            return [];
        }
    }

    async syncOfflineActivities() {
        if (!this.isOnline) return;
        
        const offlineActivities = await this.getOfflineActivities();
        if (offlineActivities.length === 0) return;
        
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
                    await this.removeOfflineActivity(activity.id);
                    console.log('✅ Synced activity:', activity.id);
                }
            } catch (error) {
                console.error('❌ Failed to sync activity:', error);
            }
        }
    }

    async removeOfflineActivity(id) {
        if (!this.db) return;
        
        try {
            const transaction = this.db.transaction(['offlineActivities'], 'readwrite');
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

    async sendNotification(title, options = {}) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return false;
        }
        
        const defaultOptions = {
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
        
        const notification = new Notification(title, { ...defaultOptions, ...options });
        
        notification.addEventListener('click', (event) => {
            if (event.action === 'explore') {
                window.focus();
            }
            notification.close();
        });
        
        return true;
    }

    showUpdateNotification() {
        this.sendNotification('PlayNotNPC Updated!', {
            body: 'A new version is available. Refresh to update.',
            tag: 'update'
        });
    }

    onOnline() {
        console.log('🌐 Back online - syncing data...');
        this.syncOfflineActivities();
        
        // Show online notification
        this.sendNotification('Back Online!', {
            body: 'Your data is syncing automatically.',
            tag: 'online'
        });
    }

    onOffline() {
        console.log('📶 Gone offline - storing data locally...');
        
        // Show offline notification
        this.sendNotification('Offline Mode', {
            body: 'You can still use the app. Data will sync when online.',
            tag: 'offline'
        });
    }

    // Check if app is installed as PWA
    isInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true;
    }

    // Get PWA installation status
    getInstallStatus() {
        return {
            isInstalled: this.isInstalled(),
            isOnline: this.isOnline,
            hasNotifications: 'Notification' in window && Notification.permission === 'granted',
            hasServiceWorker: !!this.registration
        };
    }
}

// Export singleton instance
export const pwa = new PWA(); 