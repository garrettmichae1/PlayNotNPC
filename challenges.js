// Challenges Page JavaScript
import { checkAuth, getUserStats } from './modules/auth.js';
import { showNotification } from './modules/pwa.js';

class ChallengeManager {
    constructor() {
        this.currentUser = null;
        this.friends = [];
        this.activeChallenges = [];
        this.challengeInvites = [];
        this.challengeHistory = [];
        this.selectedTemplate = null;
        this.selectedFriends = [];
        
        this.init();
    }

    async init() {
        await this.checkAuthentication();
        this.setupEventListeners();
        this.loadUserStats();
        this.loadFriends();
        this.loadChallenges();
        this.loadInvites();
        this.loadHistory();
        this.updateStats();
        // Ensure Create Challenge tab and templates are visible and first template is selected by default
        this.switchTab('create');
        setTimeout(() => {
            const firstTemplate = document.querySelector('.template-card');
            if (firstTemplate) {
                firstTemplate.click();
            }
        }, 100);
    }

    async checkAuthentication() {
        const user = await checkAuth();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = user;
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Template selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectTemplate(e.currentTarget.dataset.template);
            });
        });

        // Form actions
        document.getElementById('cancel-challenge').addEventListener('click', () => {
            this.resetForm();
        });

        document.getElementById('create-challenge').addEventListener('click', () => {
            this.createChallenge();
        });

        // History filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterHistory(e.target.dataset.filter);
            });
        });

        // Modal close
        document.querySelector('.close-modal').addEventListener('click', () => {
            this.closeModal();
        });

        // Click outside modal to close
        document.getElementById('challenge-modal').addEventListener('click', (e) => {
            if (e.target.id === 'challenge-modal') {
                this.closeModal();
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    selectTemplate(templateType) {
        // Remove previous selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Select new template
        const selectedCard = document.querySelector(`[data-template="${templateType}"]`);
        selectedCard.classList.add('selected');
        this.selectedTemplate = templateType;

        // Show form and populate with template data
        this.showForm(templateType);
    }

    showForm(templateType) {
        const form = document.getElementById('challenge-form');
        const templates = document.querySelector('.challenge-templates');
        
        templates.style.display = 'none';
        form.style.display = 'block';

        // Populate form based on template
        this.populateFormFromTemplate(templateType);
    }

    populateFormFromTemplate(templateType) {
        const templates = {
            fitness: {
                name: 'Fitness Warrior',
                description: 'Complete the most workouts in 7 days',
                duration: 7,
                type: 'workouts',
                reward: 200
            },
            study: {
                name: 'Study Sprint',
                description: 'Log the most study hours in 5 days',
                duration: 5,
                type: 'study_hours',
                reward: 150
            },
            productivity: {
                name: 'Productivity Race',
                description: 'Earn the most XP in 3 days',
                duration: 3,
                type: 'xp_earned',
                reward: 300
            },
            streak: {
                name: 'Streak Master',
                description: 'Maintain the longest activity streak',
                duration: 10,
                type: 'streak',
                reward: 250
            },
            variety: {
                name: 'Variety Champion',
                description: 'Complete activities in all categories',
                duration: 7,
                type: 'variety',
                reward: 200
            },
            custom: {
                name: '',
                description: '',
                duration: 7,
                type: 'workouts',
                reward: 200
            }
        };

        const template = templates[templateType];
        if (template) {
            document.getElementById('challenge-name').value = template.name;
            document.getElementById('challenge-description').value = template.description;
            document.getElementById('challenge-duration').value = template.duration;
            document.getElementById('challenge-type').value = template.type;
            document.getElementById('challenge-reward').value = template.reward;
        }
    }

    resetForm() {
        document.getElementById('challenge-form').style.display = 'none';
        document.querySelector('.challenge-templates').style.display = 'block';
        
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        this.selectedTemplate = null;
        this.selectedFriends = [];
        this.populateFriendsSelector();
    }

    async loadUserStats() {
        try {
            const stats = await getUserStats();
            // Only update sidebar stats
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                const levelElem = sidebar.querySelector('.level');
                const xpBarLabel = sidebar.querySelector('.xp-bar label');
                const xpProgress = sidebar.querySelector('#xp-progress');
                if (levelElem) levelElem.textContent = `Level: ${stats.level}`;
                if (xpBarLabel) xpBarLabel.textContent = `XP: ${stats.xp % 100} / 100`;
                if (xpProgress) {
                    xpProgress.value = stats.xp % 100;
                    xpProgress.max = 100;
                }
            }
        } catch (error) {
            console.error('Error loading user stats:', error);
        }
    }

    updateUserStats(stats) {
        document.querySelector('.level').textContent = `Level: ${stats.level}`;
        document.querySelector('#xp-progress').value = stats.xp % 100;
        document.querySelector('#xp-progress').max = 100;
        document.querySelector('.xp-bar label').textContent = `XP: ${stats.xp % 100} / 100`;
    }

    async loadFriends() {
        try {
            const response = await fetch('/api/friends', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.friends = await response.json();
                this.populateFriendsSelector();
            }
        } catch (error) {
            console.error('Error loading friends:', error);
        }
    }

    populateFriendsSelector() {
        const selector = document.getElementById('friends-selector');
        selector.innerHTML = '';

        if (this.friends.length === 0) {
            selector.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No friends found. Add friends to create challenges!</p>';
            return;
        }

        this.friends.forEach(friend => {
            const friendOption = document.createElement('div');
            friendOption.className = 'friend-option';
            friendOption.dataset.friendId = friend.id;
            
            friendOption.innerHTML = `
                <div class="friend-avatar">${friend.username.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="friend-name">${friend.username}</div>
                    <div class="friend-level">Level ${friend.level}</div>
                </div>
            `;
            
            friendOption.addEventListener('click', () => {
                this.toggleFriendSelection(friend.id, friendOption);
            });
            
            selector.appendChild(friendOption);
        });
    }

    toggleFriendSelection(friendId, element) {
        if (this.selectedFriends.includes(friendId)) {
            this.selectedFriends = this.selectedFriends.filter(id => id !== friendId);
            element.classList.remove('selected');
        } else {
            this.selectedFriends.push(friendId);
            element.classList.add('selected');
        }
    }

    async createChallenge() {
        const name = document.getElementById('challenge-name').value.trim();
        const description = document.getElementById('challenge-description').value.trim();
        const duration = parseInt(document.getElementById('challenge-duration').value);
        const type = document.getElementById('challenge-type').value;
        const reward = parseInt(document.getElementById('challenge-reward').value);

        if (!name || !description || this.selectedFriends.length === 0) {
            showNotification('Please fill in all fields and select at least one friend', 'error');
            return;
        }

        try {
            const response = await fetch('/api/challenges', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    name,
                    description,
                    duration,
                    type,
                    reward,
                    participants: this.selectedFriends
                })
            });

            if (response.ok) {
                const challenge = await response.json();
                showNotification('Challenge created successfully!', 'success');
                this.resetForm();
                this.loadChallenges();
                this.updateStats();
            } else {
                const error = await response.json();
                showNotification(error.message || 'Failed to create challenge', 'error');
            }
        } catch (error) {
            console.error('Error creating challenge:', error);
            showNotification('Failed to create challenge', 'error');
        }
    }

    async loadChallenges() {
        try {
            const response = await fetch('/api/challenges/active', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.activeChallenges = await response.json();
                this.renderActiveChallenges();
            }
        } catch (error) {
            console.error('Error loading challenges:', error);
        }
    }

    renderActiveChallenges() {
        const container = document.getElementById('active-challenges-container');
        
        if (this.activeChallenges.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <h3>No Active Challenges</h3>
                    <p>Create a challenge or accept an invite to get started!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.activeChallenges.map(challenge => this.renderChallengeCard(challenge)).join('');
        
        // Add click listeners to challenge cards
        container.querySelectorAll('.challenge-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showChallengeDetails(this.activeChallenges[index]);
            });
        });
    }

    renderChallengeCard(challenge) {
        const daysLeft = Math.ceil((new Date(challenge.endDate) - new Date()) / (1000 * 60 * 60 * 24));
        const progress = this.calculateProgress(challenge);
        
        return `
            <div class="challenge-card">
                <div class="challenge-header">
                    <h3 class="challenge-title">${challenge.name}</h3>
                    <span class="challenge-status ${challenge.status}">${challenge.status}</span>
                </div>
                <p class="challenge-description">${challenge.description}</p>
                <div class="challenge-meta">
                    <div class="meta-item">
                        <div class="meta-label">Duration</div>
                        <div class="meta-value">${challenge.duration} days</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Days Left</div>
                        <div class="meta-value">${daysLeft}</div>
                    </div>
                </div>
                <div class="challenge-progress">
                    <div class="progress-header">
                        <span class="progress-label">Your Progress</span>
                        <span class="progress-value">${progress.current}/${progress.target}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min(progress.percentage, 100)}%"></div>
                    </div>
                </div>
                <div class="challenge-participants">
                    <div class="participant-avatars">
                        ${challenge.participants.slice(0, 3).map(participant => 
                            `<div class="participant-avatar">${participant.username.charAt(0).toUpperCase()}</div>`
                        ).join('')}
                    </div>
                    <span class="participant-count">${challenge.participants.length} participants</span>
                </div>
            </div>
        `;
    }

    calculateProgress(challenge) {
        // This would be calculated based on the challenge type and user's activities
        // For now, returning mock data
        return {
            current: Math.floor(Math.random() * 50) + 10,
            target: 100,
            percentage: Math.floor(Math.random() * 80) + 20
        };
    }

    async loadInvites() {
        try {
            const response = await fetch('/api/challenges/invites', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.challengeInvites = await response.json();
                this.renderInvites();
            }
        } catch (error) {
            console.error('Error loading invites:', error);
        }
    }

    renderInvites() {
        const container = document.getElementById('invites-container');
        
        if (this.challengeInvites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📨</div>
                    <h3>No Challenge Invites</h3>
                    <p>You'll see challenge invites from your friends here!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.challengeInvites.map(invite => `
            <div class="invite-card">
                <div class="invite-header">
                    <h3 class="invite-title">${invite.challenge.name}</h3>
                    <div class="invite-actions">
                        <button class="btn-accept" onclick="challengeManager.acceptInvite('${invite.id}')">Accept</button>
                        <button class="btn-decline" onclick="challengeManager.declineInvite('${invite.id}')">Decline</button>
                    </div>
                </div>
                <p class="invite-details">${invite.challenge.description}</p>
                <div class="invite-meta">
                    <div class="meta-item">
                        <div class="meta-label">From</div>
                        <div class="meta-value">${invite.creator.username}</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Duration</div>
                        <div class="meta-value">${invite.challenge.duration} days</div>
                    </div>
                    <div class="meta-item">
                        <div class="meta-label">Reward</div>
                        <div class="meta-value">${invite.challenge.reward} XP</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    async acceptInvite(inviteId) {
        try {
            const response = await fetch(`/api/challenges/invites/${inviteId}/accept`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                showNotification('Challenge accepted!', 'success');
                this.loadInvites();
                this.loadChallenges();
                this.updateStats();
            } else {
                const error = await response.json();
                showNotification(error.message || 'Failed to accept challenge', 'error');
            }
        } catch (error) {
            console.error('Error accepting invite:', error);
            showNotification('Failed to accept challenge', 'error');
        }
    }

    async declineInvite(inviteId) {
        try {
            const response = await fetch(`/api/challenges/invites/${inviteId}/decline`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                showNotification('Challenge declined', 'info');
                this.loadInvites();
            } else {
                const error = await response.json();
                showNotification(error.message || 'Failed to decline challenge', 'error');
            }
        } catch (error) {
            console.error('Error declining invite:', error);
            showNotification('Failed to decline challenge', 'error');
        }
    }

    async loadHistory() {
        try {
            const response = await fetch('/api/challenges/history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                this.challengeHistory = await response.json();
                this.renderHistory();
            }
        } catch (error) {
            console.error('Error loading history:', error);
        }
    }

    renderHistory() {
        const container = document.getElementById('history-container');
        
        if (this.challengeHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📜</div>
                    <h3>No Challenge History</h3>
                    <p>Complete your first challenge to see it here!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.challengeHistory.map(challenge => `
            <div class="history-item">
                <div class="history-header">
                    <h3 class="history-title">${challenge.name}</h3>
                    <span class="history-result ${challenge.result}">${challenge.result}</span>
                </div>
                <p class="history-details">${challenge.description}</p>
                <div class="history-stats">
                    <div class="history-stat">
                        <div class="history-stat-label">Duration</div>
                        <div class="history-stat-value">${challenge.duration} days</div>
                    </div>
                    <div class="history-stat">
                        <div class="history-stat-label">Participants</div>
                        <div class="history-stat-value">${challenge.participants.length}</div>
                    </div>
                    <div class="history-stat">
                        <div class="history-stat-label">Your Score</div>
                        <div class="history-stat-value">${challenge.userScore}</div>
                    </div>
                    <div class="history-stat">
                        <div class="history-stat-label">Winner</div>
                        <div class="history-stat-value">${challenge.winner?.username || 'N/A'}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterHistory(filter) {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Filter the history based on the selected filter
        const filteredHistory = filter === 'all' 
            ? this.challengeHistory 
            : this.challengeHistory.filter(challenge => challenge.result === filter);

        this.renderFilteredHistory(filteredHistory);
    }

    renderFilteredHistory(filteredHistory) {
        const container = document.getElementById('history-container');
        
        if (filteredHistory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No Challenges Found</h3>
                    <p>No challenges match the selected filter.</p>
                </div>
            `;
            return;
        }

        // Re-render with filtered data
        container.innerHTML = filteredHistory.map(challenge => `
            <div class="history-item">
                <div class="history-header">
                    <h3 class="history-title">${challenge.name}</h3>
                    <span class="history-result ${challenge.result}">${challenge.result}</span>
                </div>
                <p class="history-details">${challenge.description}</p>
                <div class="history-stats">
                    <div class="history-stat">
                        <div class="history-stat-label">Duration</div>
                        <div class="history-stat-value">${challenge.duration} days</div>
                    </div>
                    <div class="history-stat">
                        <div class="history-stat-label">Participants</div>
                        <div class="history-stat-value">${challenge.participants.length}</div>
                    </div>
                    <div class="history-stat">
                        <div class="history-stat-label">Your Score</div>
                        <div class="history-stat-value">${challenge.userScore}</div>
                    </div>
                    <div class="history-stat">
                        <div class="history-stat-label">Winner</div>
                        <div class="history-stat-value">${challenge.winner?.username || 'N/A'}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showChallengeDetails(challenge) {
        const modal = document.getElementById('challenge-modal');
        const modalName = document.getElementById('modal-challenge-name');
        const modalType = document.getElementById('modal-challenge-type');
        const modalDuration = document.getElementById('modal-challenge-duration');
        const modalEnd = document.getElementById('modal-challenge-end');
        const modalReward = document.getElementById('modal-challenge-reward');

        modalName.textContent = challenge.name;
        modalType.textContent = this.getChallengeTypeName(challenge.type);
        modalDuration.textContent = `${challenge.duration} days`;
        modalEnd.textContent = new Date(challenge.endDate).toLocaleDateString();
        modalReward.textContent = `${challenge.reward} XP`;

        this.renderModalParticipants(challenge.participants);
        this.renderModalProgress(challenge);

        modal.style.display = 'block';
    }

    getChallengeTypeName(type) {
        const types = {
            workouts: 'Most Workouts',
            study_hours: 'Most Study Hours',
            work_hours: 'Most Work Hours',
            xp_earned: 'Most XP Earned',
            streak: 'Longest Streak',
            variety: 'Category Variety'
        };
        return types[type] || type;
    }

    renderModalParticipants(participants) {
        const container = document.getElementById('modal-participants');
        container.innerHTML = participants.map((participant, index) => `
            <div class="participant-item">
                <div class="participant-info">
                    <div class="participant-rank ${index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : ''}">${index + 1}</div>
                    <div class="participant-name">${participant.username}</div>
                </div>
                <div class="participant-score">${participant.score || 0}</div>
            </div>
        `).join('');
    }

    renderModalProgress(challenge) {
        const container = document.getElementById('modal-progress');
        // This would show detailed progress for each participant
        container.innerHTML = challenge.participants.map(participant => `
            <div class="progress-item">
                <div class="progress-info">
                    <div class="participant-name">${participant.username}</div>
                </div>
                <div class="progress-score">${participant.progress || 0}%</div>
            </div>
        `).join('');
    }

    closeModal() {
        document.getElementById('challenge-modal').style.display = 'none';
    }

    updateStats() {
        // Update challenge statistics
        document.getElementById('active-challenges').textContent = this.activeChallenges.length;
        
        const wonChallenges = this.challengeHistory.filter(c => c.result === 'won').length;
        document.getElementById('challenges-won').textContent = wonChallenges;
        
        const totalXP = this.challengeHistory
            .filter(c => c.result === 'won')
            .reduce((sum, c) => sum + (c.reward || 0), 0);
        document.getElementById('challenge-xp').textContent = totalXP;
        
        const winRate = this.challengeHistory.length > 0 
            ? Math.round((wonChallenges / this.challengeHistory.length) * 100)
            : 0;
        document.getElementById('win-rate').textContent = `${winRate}%`;
    }
}

// Initialize the challenge manager when the page loads
let challengeManager;

document.addEventListener('DOMContentLoaded', () => {
    challengeManager = new ChallengeManager();
});

// Make challengeManager globally available for button onclick handlers
window.challengeManager = challengeManager; 