import { Auth } from './modules/auth.js';
import { ActivityManager } from './modules/activityManager.js';
import { initializeMobileNavigation } from './modules/mobileNav.js';
import { initializeMobileOptimizations, testMobileFunctionality } from './modules/mobileOptimizations.js';
import { pwa } from './modules/pwa.js';

// --- AUTHENTICATION ---
// Ensure user is authenticated
if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
}

// --- MOBILE DEBUGGING ---
// Add mobile debugging information
function logMobileDebug() {
    console.log('📱 Mobile Debug Info:');
    console.log('- Touch Support:', 'ontouchstart' in window);
    console.log('- Max Touch Points:', navigator.maxTouchPoints);
    console.log('- Viewport:', window.innerWidth + 'x' + window.innerHeight);
    console.log('- User Agent:', navigator.userAgent);
    console.log('- Platform:', navigator.platform);
    console.log('- Mobile Device Class:', document.body.classList.contains('mobile-device'));
}

// Comprehensive mobile test function
function runComprehensiveMobileTest() {
    console.log('🧪 Running comprehensive mobile test...');
    
    // Test 1: Check all navigation elements
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const navLinks = document.querySelectorAll('.nav-link');
    
    console.log('🧪 Test 1 - Navigation Elements:');
    console.log('- Mobile Menu Toggle:', !!mobileMenuToggle);
    console.log('- Sidebar:', !!sidebar);
    console.log('- Sidebar Overlay:', !!sidebarOverlay);
    console.log('- Nav Links Count:', navLinks.length);
    
    // Test 2: Check nav links have proper href attributes
    console.log('🧪 Test 2 - Nav Links Href Check:');
    navLinks.forEach((link, index) => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        console.log(`- Link ${index + 1}: "${text}" -> ${href}`);
    });
    
    // Test 3: Check mobile functionality
    const mobileTest = testMobileFunctionality();
    console.log('🧪 Test 3 - Mobile Functionality:', mobileTest);
    
    // Test 4: Simulate mobile menu toggle
    if (mobileMenuToggle) {
        console.log('🧪 Test 4 - Simulating mobile menu toggle...');
        const clickEvent = new Event('click', { bubbles: true });
        mobileMenuToggle.dispatchEvent(clickEvent);
        
        setTimeout(() => {
            const isOpen = sidebar.classList.contains('mobile-open') || sidebar.classList.contains('active');
            console.log('- Menu opened successfully:', isOpen);
            
            // Close menu
            mobileMenuToggle.dispatchEvent(clickEvent);
        }, 500);
    }
    
    // Test 5: Check event listeners
    console.log('🧪 Test 5 - Event Listeners Check:');
    const events = ['click', 'touchstart', 'touchend'];
    events.forEach(eventType => {
        const listeners = getEventListeners(mobileMenuToggle);
        console.log(`- ${eventType} listeners:`, listeners ? listeners.length : 'N/A');
    });
    
    return {
        navigationElements: {
            mobileMenuToggle: !!mobileMenuToggle,
            sidebar: !!sidebar,
            sidebarOverlay: !!sidebarOverlay,
            navLinksCount: navLinks.length
        },
        mobileFunctionality: mobileTest,
        navLinks: Array.from(navLinks).map(link => ({
            text: link.textContent.trim(),
            href: link.getAttribute('href')
        }))
    };
}

// Helper function to get event listeners (for debugging)
function getEventListeners(element) {
    if (!element) return null;
    
    // This is a simplified version - in real browsers you'd need dev tools
    return {
        click: element.onclick ? 1 : 0,
        touchstart: element.ontouchstart ? 1 : 0,
        touchend: element.ontouchend ? 1 : 0
    };
}

// --- BADGE RENDERING ---
// Render streak and prestige badges based on user stats.
function renderBadges(user) {
    const badgeContainer = document.querySelector('.badge-container');
    if (!badgeContainer) {
        console.warn('Badge container not found, skipping badge rendering');
        return;
    }
    
    badgeContainer.innerHTML = '';

    // Daily streak badge
    if (user.streakCount && user.streakCount > 0) {
        const streakBadge = document.createElement('span');
        streakBadge.className = 'badge streak-badge';
        streakBadge.title = `Daily Streak: ${user.streakCount} days`;
        streakBadge.innerHTML = `🔥 ${user.streakCount}`;
        badgeContainer.appendChild(streakBadge);
    }

    // Prestige badge for every 100 levels
    if (user.level && user.level >= 100) {
        const prestigeCount = Math.floor(user.level / 100);
        for (let i = 0; i < prestigeCount; i++) {
            const prestigeBadge = document.createElement('span');
            prestigeBadge.className = 'badge prestige-badge';
            prestigeBadge.title = `Prestige ${i + 1}: Reached level ${(i + 1) * 100}`;
            prestigeBadge.innerHTML = `🌟`;
            badgeContainer.appendChild(prestigeBadge);
        }
    }
}

// --- FETCH USER STATS FROM BACKEND ---
// Fetch user stats from the backend and update the UI.
async function fetchAndRenderStats() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        // First, check for initial stats from login (this is the key fix!)
        const initialStats = localStorage.getItem('initialStats');
        if (initialStats) {
            const stats = JSON.parse(initialStats);
            updateStatsDisplay(stats);
            localStorage.removeItem('initialStats'); // Clear after using
            console.log('Using initial stats from login:', stats);
        }
        
        // Also check for cached stats from pre-fetch
        const cachedStats = localStorage.getItem('userStats');
        if (cachedStats) {
            const stats = JSON.parse(cachedStats);
            updateStatsDisplay(stats);
            localStorage.removeItem('userStats'); // Clear cache after using it
            console.log('Using cached stats from pre-fetch:', stats);
        }
        
        // Fetch fresh stats from API
        const res = await fetch('/api/users/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        const stats = await res.json();
        updateStatsDisplay(stats);
        console.log('Fetched fresh stats from API:', stats);
        
        return stats;
    } catch (e) {
        console.error('Error fetching stats:', e);
        return null;
    }
}

// Helper function to update stats display
function updateStatsDisplay(stats) {
    // Update level display
    const levelElement = document.querySelector('.level');
    if (levelElement) {
        levelElement.textContent = `Level: ${stats.level}`;
    }
    
    // Update XP bar label
    const xpBarLabel = document.querySelector('.xp-bar label');
    if (xpBarLabel) {
        xpBarLabel.textContent = `XP: ${stats.xp} / ${stats.level * 100}`;
    }
    
    // Update XP progress bar
    const xpProgress = document.getElementById('xp-progress');
    if (xpProgress) {
        xpProgress.value = stats.xp;
        xpProgress.max = stats.level * 100;
    }

    // Update XP bar in dashboard if it exists
    const xpBar = document.getElementById('xpBar');
    if (xpBar) {
        const percent = Math.min(100, Math.round((stats.xp / (stats.level * 100)) * 100));
        xpBar.style.width = percent + '%';
        xpBar.textContent = percent + '%';
    }

    // Render badges
    renderBadges(stats);
}

// Initialize the application
async function initializeApp() {
    try {
        console.log('=== INITIALIZE APP START ===');
        
        // Register Service Worker for PWA
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered successfully:', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 New version available');
                            // You could show a notification to the user here
                        }
                    });
                });
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.log('⚠️ Service Worker not supported');
        }
        
        // Check authentication
        if (!Auth.isAuthenticated()) {
            console.log('User not authenticated, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('User is authenticated, proceeding with initialization');
        
        // Log mobile debug info
        logMobileDebug();
        
        // Initialize mobile functionality
        console.log('🔧 Initializing mobile functionality...');
        initializeMobileNavigation();
        initializeMobileOptimizations();
        
        // Immediately display any cached stats (this ensures instant display)
        const initialStats = localStorage.getItem('initialStats');
        const cachedStats = localStorage.getItem('userStats');
        
        console.log('Checking cached stats:', { initialStats: !!initialStats, cachedStats: !!cachedStats });
        
        if (initialStats) {
            const stats = JSON.parse(initialStats);
            updateStatsDisplay(stats);
            localStorage.removeItem('initialStats');
            console.log('Immediately displayed initial stats:', stats);
        } else if (cachedStats) {
            const stats = JSON.parse(cachedStats);
            updateStatsDisplay(stats);
            localStorage.removeItem('userStats');
            console.log('Immediately displayed cached stats:', stats);
        }
        
        // Fetch fresh stats
        console.log('Fetching fresh stats from API...');
        const stats = await fetchAndRenderStats();
        
        if (!stats) {
            console.error('Failed to fetch initial stats');
            return;
        }

        // Initialize activity manager
        console.log('Initializing ActivityManager...');
        const activityManager = new ActivityManager();
        console.log('ActivityManager initialized successfully');
        
        // Load activities after ActivityManager is ready
        console.log('Loading activities...');
        await activityManager.initialize();
        console.log('Activities loaded successfully');

        // --- DOM ELEMENTS ---
        console.log('Setting up DOM elements...');
        const diaryForm = document.getElementById('diary-form');
        const logoutBtn = document.getElementById('logoutBtn');
        
        console.log('DOM elements found:', { diaryForm: !!diaryForm, logoutBtn: !!logoutBtn });

        // --- EVENT HANDLERS ---
        if (diaryForm) {
            console.log('Adding form event handler in app.js');
            
            // Add custom activity functionality
            const typeSelect = document.getElementById('entry-type');
            const customActivityGroup = document.getElementById('custom-activity-group');
            const customActivityInput = document.getElementById('custom-activity-name');
            
            if (typeSelect && customActivityGroup && customActivityInput) {
                typeSelect.addEventListener('change', () => {
                    if (typeSelect.value === 'custom') {
                        customActivityGroup.style.display = 'block';
                        customActivityInput.required = true;
                    } else {
                        customActivityGroup.style.display = 'none';
                        customActivityInput.required = false;
                        customActivityInput.value = '';
                    }
                });
            }
            
            diaryForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                console.log('=== FORM SUBMISSION START ===');
                console.log('Form submitted from app.js - THIS IS THE CORRECT HANDLER');
                console.log('Form element:', diaryForm);
                console.log('Form action:', diaryForm.action);
                console.log('Form method:', diaryForm.method);
                
                // Get form data
                const titleInput = document.getElementById('entry-description');
                const amountInput = document.getElementById('entry-value');
                const typeInput = document.getElementById('entry-type');
                const customActivityInput = document.getElementById('custom-activity-name');

                console.log('Form elements found:', {
                    titleInput: !!titleInput,
                    amountInput: !!amountInput,
                    typeInput: !!typeInput,
                    customActivityInput: !!customActivityInput
                });

                if (!titleInput || !amountInput || !typeInput) {
                    console.error('Form elements not found');
                    return;
                }

                // Validate inputs
                if (!titleInput.value || isNaN(parseFloat(amountInput.value)) || parseFloat(amountInput.value) <= 0) {
                    showFormNotification("Please fill in all fields with valid data!", "warning");
                    return;
                }
                
                // Validate custom activity
                if (typeInput.value === 'custom') {
                    if (!customActivityInput || !customActivityInput.value.trim()) {
                        showFormNotification("Please enter a custom activity name!", "warning");
                        return;
                    }
                }
                
                // NEW: Duration limit validation
                if (parseFloat(amountInput.value) > 720) {
                    showDurationLimitNotification();
                    amountInput.focus();
                    return;
                }

                try {
                    // Determine the activity type
                    let activityType = typeInput.value;
                    if (typeInput.value === 'custom') {
                        activityType = customActivityInput.value.trim();
                    }
                    
                    const activityData = {
                        type: activityType,
                        title: titleInput.value,
                        duration: parseFloat(amountInput.value)
                    };
                    
                    console.log('Submitting activity:', activityData);

                    const response = await fetch('/api/activities', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(activityData)
                    });

                    console.log('Response status:', response.status);
                    console.log('Response ok:', response.ok);

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.error('Response error:', errorText);
                        throw new Error('Failed to add activity');
                    }

                    const data = await response.json();
                    console.log('Activity added successfully:', data);

                    // Add the new activity to the list
                    if (data.activity) {
                        console.log('Adding activity to list:', data.activity);
                        activityManager.addActivityToList(data.activity);
                    }

                    // Refresh stats
                    console.log('Refreshing stats...');
                    await fetchAndRenderStats();

                    // Clear form
                    diaryForm.reset();
                    console.log('Form cleared');
                    console.log('=== FORM SUBMISSION END ===');
                } catch (error) {
                    console.error('Error adding activity:', error);
                    showFormNotification('Failed to add activity. Please try again.', 'error');
                }
            });
            console.log('Form event handler added successfully');
        } else {
            console.error('Diary form not found!');
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
                // Clear any cached stats
                localStorage.removeItem('initialStats');
                localStorage.removeItem('userStats');
                window.location.href = 'login.html';
            });
        }

        // Set up periodic stats refresh (every 30 seconds)
        setInterval(fetchAndRenderStats, 30000);

        // Run comprehensive mobile test after initialization
        setTimeout(() => {
            console.log('🧪 Running mobile functionality test...');
            const testResults = runComprehensiveMobileTest();
            console.log('🧪 Mobile test completed:', testResults);
        }, 1000);

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Start the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== APP INITIALIZATION START ===');
    console.log('App.js loaded, initializing application...');
    console.log('Current URL:', window.location.href);
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('Initial stats exists:', !!localStorage.getItem('initialStats'));
    console.log('User stats exists:', !!localStorage.getItem('userStats'));
    
    // Update debug info immediately
    updateDebugInfo();
    
    initializeApp();
    console.log('=== APP INITIALIZATION END ===');
});

// Refresh stats when the page becomes visible again
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        fetchAndRenderStats();
    }
});

// Debug function to update debug info
function updateDebugInfo() {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
        const token = localStorage.getItem('token');
        const initialStats = localStorage.getItem('initialStats');
        const userStats = localStorage.getItem('userStats');
        
        debugInfo.innerHTML = `
            <p><strong>Token:</strong> ${token ? 'Present' : 'Missing'}</p>
            <p><strong>Initial Stats:</strong> ${initialStats ? 'Present' : 'Missing'}</p>
            <p><strong>User Stats:</strong> ${userStats ? 'Present' : 'Missing'}</p>
            <p><strong>Current URL:</strong> ${window.location.href}</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        `;
    }
}

// Update debug info periodically
setInterval(updateDebugInfo, 2000);

// Export the comprehensive test function for debugging
window.runComprehensiveMobileTest = runComprehensiveMobileTest;

// Achievement notification function
function showAchievementNotification(achievement) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🎉</div>
            <div class="notification-text">
                <h3>Achievement Unlocked!</h3>
                <p>${achievement.title}</p>
                <span class="xp-reward">+${achievement.xpReward} XP</span>
            </div>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
        border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add this helper for the duration limit notification
function showDurationLimitNotification() {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">⏰</div>
            <div class="notification-text">
                <h3>Whoa! That's too much time!</h3>
                <p>The maximum allowed for a single activity is <strong>720 minutes (12 hours)</strong>.<br>Please enter a value less than or equal to 720.</p>
            </div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(255, 152, 0, 0.3);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 340px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        font-size: 16px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add this helper for form notifications
function showFormNotification(message, type = 'warning') {
    const notification = document.createElement('div');
    notification.className = 'form-notification';
    
    const icon = type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️';
    const bgColor = type === 'warning' ? 'linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)' : 
                   type === 'error' ? 'linear-gradient(135deg, #f44336 0%, #ef5350 100%)' : 
                   'linear-gradient(135deg, #2196F3 0%, #4CAF50 100%)';
    
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">${icon}</div>
            <div class="notification-text">
                <h3>${type === 'warning' ? 'Please Check' : type === 'error' ? 'Error' : 'Info'}</h3>
                <p>${message}</p>
            </div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(255, 152, 0, 0.3);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 340px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        font-size: 16px;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}
