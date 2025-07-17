// Activity handler module
export class ActivityManager {
    constructor() {
        console.log('=== ACTIVITY MANAGER CONSTRUCTOR START ===');
        console.log('ActivityManager constructor called');
        
        this.form = document.getElementById('diary-form');
        this.entryList = document.querySelector('.entry-list');
        this.levelDisplay = document.querySelector('.level');
        this.xpLabel = document.querySelector('.xp-bar label');
        this.xpProgress = document.getElementById('xp-progress');
        
        console.log('ActivityManager elements found:', {
            form: !!this.form,
            entryList: !!this.entryList,
            levelDisplay: !!this.levelDisplay,
            xpLabel: !!this.xpLabel,
            xpProgress: !!this.xpProgress
        });
        
        if (!this.entryList) {
            console.error('Entry list element not found! This is critical for displaying activities.');
        }
        
        // Don't set up event listeners here - let app.js handle form submission
        // this.setupEventListeners();
        
        // Don't automatically load activities - let app.js call it when ready
        // console.log('Loading activities...');
        // this.loadActivities();
        
        // Remove the old call that was still here
        console.log('=== ACTIVITY MANAGER CONSTRUCTOR END ===');
    }

    // New method to initialize activities after DOM is ready
    async initialize() {
        console.log('=== ACTIVITY MANAGER INITIALIZE START ===');
        console.log('Initializing ActivityManager and loading activities...');
        await this.loadActivities();
        console.log('=== ACTIVITY MANAGER INITIALIZE END ===');
    }

    setupEventListeners() {
        console.log('Setting up event listeners - DISABLED');
        // DISABLED: Let app.js handle form submission to avoid conflicts
        // if (this.form) {
        //     this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        //     console.log('Event listener added to form');
        // }
    }

    async handleSubmit(event) {
        // DISABLED: This method should not be called - form is handled by app.js
        console.log('=== ACTIVITY MANAGER HANDLE SUBMIT CALLED - THIS SHOULD NOT HAPPEN ===');
        console.log('Form submission should be handled by app.js, not ActivityManager');
        event.preventDefault();
        return false; // Prevent any further processing
    }

    async loadActivities() {
        try {
            console.log('=== LOAD ACTIVITIES START ===');
            console.log('Loading activities...');
            console.log('Entry list element exists:', !!this.entryList);
            console.log('Entry list element:', this.entryList);
            
            const response = await fetch('/api/activities?limit=1000', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error('Failed to fetch activities');
            }

            const data = await response.json();
            console.log('Raw response data:', data);
            
            // Support both array and paginated object for backward compatibility
            const activities = Array.isArray(data) ? data : (data.activities || []);
            console.log('Activities array:', activities);
            console.log('Number of activities:', activities.length);
            console.log('Activities type:', typeof activities);
            console.log('Is array:', Array.isArray(activities));
            
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

    addActivityToList(activity) {
        console.log('=== ADD ACTIVITY TO LIST START ===');
        console.log('Adding activity to list:', activity);
        console.log('Entry list element exists:', !!this.entryList);
        
        if (!this.entryList) {
            console.error('Entry list not found');
            return;
        }
        
        const li = document.createElement('li');
        li.className = 'card entry-item';
        
        // Format the date
        const date = new Date(activity.createdAt || activity.date);
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

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

        console.log('Created list item:', li);
        console.log('List item HTML:', li.outerHTML);

        // Add new entry to the end of the list (since we're sorting by date)
        this.entryList.appendChild(li);
        console.log('Activity added to list');
        console.log('Current entry list children count:', this.entryList.children.length);
        console.log('=== ADD ACTIVITY TO LIST END ===');
    }

    renderActivities(activities) {
        console.log('=== RENDER ACTIVITIES START ===');
        console.log('Activities to render:', activities);
        console.log('Entry list element exists:', !!this.entryList);
        console.log('Entry list element:', this.entryList);
        
        if (!this.entryList) {
            console.error('Entry list not found');
            return;
        }
        
        console.log('Clearing entry list...');
        this.entryList.innerHTML = '';
        console.log('Entry list cleared');
        
        if (!activities || activities.length === 0) {
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
        
        console.log('Sorted activities (newest first):', sortedActivities);
        console.log('Rendering activities...');
        sortedActivities.forEach((activity, index) => {
            console.log(`Rendering activity ${index + 1}:`, activity);
            this.addActivityToList(activity);
        });
        
        console.log('=== RENDER ACTIVITIES END ===');
    }

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

    showLevelUpMessage(levelUp) {
        const message = document.createElement('div');
        message.className = 'level-up-message';
        message.textContent = levelUp.message;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

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
            
            console.log('Stats refreshed:', stats);
        } catch (error) {
            console.error('Error refreshing stats:', error);
        }
    }
}
