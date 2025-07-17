// Activity handler module
// Manages loading, rendering, and updating user activities in the UI
export class ActivityManager {
    constructor() {
        // Log the start of the constructor for debugging
        console.log('=== ACTIVITY MANAGER CONSTRUCTOR START ===');
        console.log('ActivityManager constructor called');
        
        // Cache references to important DOM elements
        this.form = document.getElementById('diary-form');
        this.entryList = document.querySelector('.entry-list');
        this.levelDisplay = document.querySelector('.level');
        this.xpLabel = document.querySelector('.xp-bar label');
        this.xpProgress = document.getElementById('xp-progress');
        
        // Log which elements were found for debugging
        console.log('ActivityManager elements found:', {
            form: !!this.form,
            entryList: !!this.entryList,
            levelDisplay: !!this.levelDisplay,
            xpLabel: !!this.xpLabel,
            xpProgress: !!this.xpProgress
        });
        
        if (!this.entryList) {
            // Critical error if entry list is missing
            console.error('Entry list element not found! This is critical for displaying activities.');
        }
        
        // Event listeners and activity loading are handled externally (see app.js)
        // console.log('=== ACTIVITY MANAGER CONSTRUCTOR END ===');
    }

    // Initialize activities after DOM is ready
    async initialize() {
        console.log('=== ACTIVITY MANAGER INITIALIZE START ===');
        console.log('Initializing ActivityManager and loading activities...');
        await this.loadActivities();
        console.log('=== ACTIVITY MANAGER INITIALIZE END ===');
    }

    // (Disabled) Setup event listeners for the form
    setupEventListeners() {
        console.log('Setting up event listeners - DISABLED');
        // Event listeners are managed by app.js to avoid conflicts
    }

    // (Disabled) Handle form submission (should be handled by app.js)
    async handleSubmit(event) {
        console.log('=== ACTIVITY MANAGER HANDLE SUBMIT CALLED - THIS SHOULD NOT HAPPEN ===');
        console.log('Form submission should be handled by app.js, not ActivityManager');
        event.preventDefault();
        return false; // Prevent any further processing
    }

    // Load activities from the server and render them
    async loadActivities() {
        try {
            console.log('=== LOAD ACTIVITIES START ===');
            // Fetch activities from the API (up to 1000 for now)
            const response = await fetch('/api/activities?limit=1000', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            // Support both array and paginated object for backward compatibility
            const activities = Array.isArray(data) ? data : (data.activities || []);
            if (Array.isArray(activities)) {
                this.renderActivities(activities);
            } else {
                console.error('Activities is not an array:', activities);
                this.renderActivities([]);
            }
            console.log('=== LOAD ACTIVITIES END ===');
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    }

    // Add a single activity to the entry list in the UI
    addActivityToList(activity) {
        if (!this.entryList) {
            console.error('Entry list not found');
            return;
        }
        const li = document.createElement('li');
        li.className = 'card entry-item';
        // Format the date for display
        const date = new Date(activity.createdAt || activity.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        // Build the activity entry HTML
        li.innerHTML = `
            <div class="entry-details">
                <span class="entry-category">[${activity.type}]</span>
                <p class="entry-description">${activity.title}</p>
                <span class="entry-duration">${activity.duration} minutes</span>
            </div>
            <div class="entry-meta">
                <span class="entry-value">+${activity.xpEarned} XP</span>
                <span class="entry-date">${formattedDate}</span>
            </div>
        `;
        // Add new entry to the end of the list (sorted by date)
        this.entryList.appendChild(li);
    }

    // Render all activities in the entry list
    renderActivities(activities) {
        if (!this.entryList) {
            console.error('Entry list not found');
            return;
        }
        // Clear the current list
        this.entryList.innerHTML = '';
        if (!activities || activities.length === 0) {
            // Show a message if there are no activities
            const msg = document.createElement('li');
            msg.className = 'no-activities-message';
            msg.innerHTML = '<span>📝</span> No activities are logged yet.<br>When you add activities, they will appear here!';
            this.entryList.appendChild(msg);
            return;
        }
        // Sort activities by date (newest first)
        const sortedActivities = activities.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.date);
            const dateB = new Date(b.createdAt || b.date);
            return dateB - dateA; // Newest first
        });
        // Render each activity
        sortedActivities.forEach((activity) => {
            this.addActivityToList(activity);
        });
    }

    // Update the progress bar and level display in the UI
    updateProgress(progress) {
        if (!progress) {
            console.warn('No progress data provided to updateProgress');
            return;
        }
        if (this.levelDisplay) {
            this.levelDisplay.textContent = `Level: ${progress.level}`;
        }
        if (this.xpLabel) {
            this.xpLabel.textContent = `XP: ${progress.xp} / ${progress.level * 100}`;
        }
        if (this.xpProgress) {
            this.xpProgress.value = progress.xp;
            this.xpProgress.max = progress.level * 100;
        }
    }

    // Show a temporary message when the user levels up
    showLevelUpMessage(levelUp) {
        const message = document.createElement('div');
        message.className = 'level-up-message';
        message.textContent = levelUp.message;
        document.body.appendChild(message);
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Show achievement notifications in the UI
    showAchievements(achievements) {
        achievements.forEach(achievement => {
            const notification = document.createElement('div');
            notification.className = 'achievement-notification';
            notification.innerHTML = `
                <h3>🏆 New Achievement!</h3>
                <p>${achievement.name}</p>
                <p>${achievement.description}</p>
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                notification.remove();
            }, 5000);
        });
    }

    // Refresh user stats from the server and update the UI
    async refreshStats() {
        try {
            const response = await fetch('/api/users/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }
            const stats = await response.json();
            // Update level display
            if (this.levelDisplay) {
                this.levelDisplay.textContent = `Level: ${stats.level}`;
            }
            // Update XP bar label
            if (this.xpLabel) {
                this.xpLabel.textContent = `XP: ${stats.xp} / ${stats.level * 100}`;
            }
            // Update XP progress bar
            if (this.xpProgress) {
                this.xpProgress.value = stats.xp;
                this.xpProgress.max = stats.level * 100;
            }
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    }
}
