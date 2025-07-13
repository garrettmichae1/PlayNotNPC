import { Auth } from './modules/auth.js';
import { AchievementManager } from './modules/achievements.js';

class AchievementsPage {
    constructor() {
        this.achievementManager = new AchievementManager();
        this.currentCategory = 'all';
        this.userStats = null;
        this.activities = [];
        this.init();
    }

    async init() {
        // Check authentication
        if (!Auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Set up event listeners
        this.setupEventListeners();
        
        // Load data and render achievements
        await this.loadData();
        
        // Update user stats
        this.updateUserStats();
    }

    setupEventListeners() {
        // Category tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.category;
                this.renderAchievements();
            });
        });

        // Modal close button
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideModal();
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('achievement-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal();
                }
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                Auth.logout();
                window.location.href = 'login.html';
            });
        }
    }

    async loadData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Fetch user stats and activities
            const [statsResponse, activitiesResponse] = await Promise.all([
                fetch('/api/users/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/activities?limit=1000', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (!statsResponse.ok || !activitiesResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            this.userStats = await statsResponse.json();
            const activitiesData = await activitiesResponse.json();
            this.activities = Array.isArray(activitiesData) ? activitiesData : activitiesData.activities || [];

            // Check for new achievements
            const newAchievements = this.achievementManager.checkAchievements(this.userStats, this.activities);
            
            if (newAchievements.length > 0) {
                this.showAchievementUnlock(newAchievements[0]);
            }

            // Render achievements
            this.renderAchievements();
            this.updateStats();

        } catch (error) {
            console.error('Error loading achievements data:', error);
        }
    }

    renderAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        const allAchievements = this.achievementManager.getAllAchievements();
        const filteredAchievements = this.currentCategory === 'all' 
            ? allAchievements 
            : allAchievements.filter(a => a.category === this.currentCategory);

        container.innerHTML = filteredAchievements.map(achievement => 
            this.createAchievementCard(achievement)
        ).join('');
    }

    createAchievementCard(achievement) {
        const progress = this.achievementManager.getAchievementProgress(
            achievement.id, 
            this.userStats, 
            this.activities
        );

        const statusClass = achievement.unlocked ? 'unlocked' : 'locked';
        const progressText = achievement.unlocked 
            ? 'Completed!' 
            : `${Math.round(progress)}% Complete`;

        return `
            <div class="achievement-card ${statusClass}" data-id="${achievement.id}">
                <div class="achievement-reward">+${achievement.xpReward} XP</div>
                <div class="achievement-category">${achievement.category}</div>
                
                <div class="achievement-header">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-info">
                        <h3>${achievement.title}</h3>
                        <p>${achievement.description}</p>
                    </div>
                </div>
                
                <div class="achievement-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">${progressText}</div>
                </div>
            </div>
        `;
    }

    updateStats() {
        const allAchievements = this.achievementManager.getAllAchievements();
        const unlockedCount = allAchievements.filter(a => a.unlocked).length;
        const totalCount = allAchievements.length;
        const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
        const totalXp = allAchievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

        document.getElementById('total-achievements').textContent = totalCount;
        document.getElementById('unlocked-achievements').textContent = unlockedCount;
        document.getElementById('completion-percentage').textContent = `${completionPercentage}%`;
        document.getElementById('achievement-xp').textContent = totalXp;
    }

    showAchievementUnlock(achievement) {
        const modal = document.getElementById('achievement-modal');
        const modalIcon = document.getElementById('modal-icon');
        const modalTitle = document.getElementById('modal-title');
        const modalDescription = document.getElementById('modal-description');
        const modalXp = document.getElementById('modal-xp');

        if (modal && modalIcon && modalTitle && modalDescription && modalXp) {
            modalIcon.textContent = achievement.icon;
            modalTitle.textContent = achievement.title;
            modalDescription.textContent = achievement.description;
            modalXp.textContent = achievement.xpReward;

            modal.style.display = 'block';
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                this.hideModal();
            }, 3000);
        }
    }

    hideModal() {
        const modal = document.getElementById('achievement-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async updateUserStats() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/users/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch user stats');
            
            const stats = await response.json();
            
            // Update level display
            const levelElement = document.querySelector('.level');
            if (levelElement) {
                levelElement.textContent = `Level: ${stats.level}`;
            }
            
            // Update XP bar
            const xpBarLabel = document.querySelector('.xp-bar label');
            if (xpBarLabel) {
                xpBarLabel.textContent = `XP: ${stats.xp} / ${stats.level * 100}`;
            }
            
            const xpProgress = document.getElementById('xp-progress');
            if (xpProgress) {
                xpProgress.value = stats.xp;
                xpProgress.max = stats.level * 100;
            }
        } catch (error) {
            console.error('Error updating user stats:', error);
        }
    }
}

// Initialize achievements page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AchievementsPage();
}); 