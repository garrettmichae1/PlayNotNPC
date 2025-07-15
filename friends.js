import { Auth } from './modules/auth.js';

class FriendsPage {
    constructor() {
        this.currentTab = 'friends';
        this.friends = [];
        this.pendingRequests = [];
        this.leaderboard = [];
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
        
        // Load initial data
        await this.loadData();
        
        // Update user stats
        this.updateUserStats();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search functionality
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }

        // Modal close
        const closeModal = document.querySelector('.close-modal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideModal());
        }

        // Close modal when clicking outside
        const modal = document.getElementById('friend-modal');
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

        // Set up dynamic event listeners
        this.setupDynamicEventListeners();
    }

    setupDynamicEventListeners() {
        // Use event delegation for dynamically created elements
        document.addEventListener('click', (e) => {
            // Friend card actions
            if (e.target.classList.contains('btn-view')) {
                const friendId = e.target.dataset.friendId;
                if (friendId) this.viewFriendProfile(friendId);
            }
            
            if (e.target.classList.contains('btn-remove')) {
                const friendshipId = e.target.dataset.friendshipId;
                if (friendshipId) this.removeFriend(friendshipId);
            }

            // Request actions
            if (e.target.classList.contains('btn-accept')) {
                const requestId = e.target.dataset.requestId;
                if (requestId) this.acceptRequest(requestId);
            }
            
            if (e.target.classList.contains('btn-decline')) {
                const requestId = e.target.dataset.requestId;
                if (requestId) this.declineRequest(requestId);
            }

            // Search result actions
            if (e.target.classList.contains('btn-add-friend')) {
                const email = e.target.dataset.email;
                if (email) this.sendFriendRequest(email);
            }
        });
    }

    async loadData() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            // Load friends, requests, and leaderboard
            const [friendsResponse, requestsResponse, leaderboardResponse] = await Promise.all([
                fetch('/api/friends', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/friends/requests', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/friends/leaderboard', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (friendsResponse.ok) {
                this.friends = await friendsResponse.json();
                this.renderFriends();
            }

            if (requestsResponse.ok) {
                this.pendingRequests = await requestsResponse.json();
                this.renderRequests();
            }

            if (leaderboardResponse.ok) {
                this.leaderboard = await leaderboardResponse.json();
                this.renderLeaderboard();
            }

            // Update stats
            this.updateStats();

        } catch (error) {
            console.error('Error loading friends data:', error);
        }
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

        this.currentTab = tabName;
    }

    renderFriends() {
        const container = document.getElementById('friends-container');
        if (!container) return;

        if (this.friends.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Friends Yet</h3>
                    <p>Start by adding some friends to see their progress and compete on the leaderboard!</p>
                    <button class="btn-primary" id="add-friends-btn">Add Friends</button>
                </div>
            `;
            
            // Add event listener for the button
            const addFriendsBtn = document.getElementById('add-friends-btn');
            if (addFriendsBtn) {
                addFriendsBtn.addEventListener('click', () => this.switchTab('search'));
            }
            return;
        }

        container.innerHTML = this.friends.map(friend => this.createFriendCard(friend)).join('');
    }

    createFriendCard(friend) {
        const avatar = friend.username.charAt(0).toUpperCase();
        const achievementCount = friend.unlockedAchievements ? friend.unlockedAchievements.length : 0;

        return `
            <div class="friend-card" data-friend-id="${friend.id}">
                <div class="friend-header">
                    <div class="friend-avatar">${avatar}</div>
                    <div class="friend-info">
                        <h3>${friend.username}</h3>
                        <p>Level ${friend.level}</p>
                    </div>
                </div>
                
                <div class="friend-stats-row">
                    <div class="friend-stat">
                        <span class="stat-label">XP</span>
                        <span class="stat-value">${friend.xp}</span>
                    </div>
                    <div class="friend-stat">
                        <span class="stat-label">Streak</span>
                        <span class="stat-value">${friend.streakCount || 0}</span>
                    </div>
                    <div class="friend-stat">
                        <span class="stat-label">Achievements</span>
                        <span class="stat-value">${achievementCount}</span>
                    </div>
                    <div class="friend-stat">
                        <span class="stat-label">Member Since</span>
                        <span class="stat-value">${new Date(friend.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div class="friend-actions">
                    <button class="btn-view" data-friend-id="${friend.id}">View Profile</button>
                    <button class="btn-remove" data-friendship-id="${friend.friendshipId}">Remove</button>
                </div>
            </div>
        `;
    }

    renderRequests() {
        const container = document.getElementById('requests-container');
        if (!container) return;

        if (this.pendingRequests.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Pending Requests</h3>
                    <p>You don't have any pending friend requests.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.pendingRequests.map(request => this.createRequestCard(request)).join('');
    }

    createRequestCard(request) {
        const avatar = request.requester.username.charAt(0).toUpperCase();

        return `
            <div class="request-card" data-request-id="${request._id}">
                <div class="request-header">
                    <div class="request-avatar">${avatar}</div>
                    <div class="request-info">
                        <h3>${request.requester.username}</h3>
                        <p>Level ${request.requester.level}</p>
                    </div>
                </div>
                
                <div class="request-actions">
                    <button class="btn-accept" data-request-id="${request._id}">Accept</button>
                    <button class="btn-decline" data-request-id="${request._id}">Decline</button>
                </div>
            </div>
        `;
    }

    renderLeaderboard() {
        const container = document.getElementById('leaderboard-container');
        if (!container) return;

        container.innerHTML = this.leaderboard.map((user, index) => this.createLeaderboardItem(user, index + 1)).join('');
    }

    createLeaderboardItem(user, rank) {
        const avatar = user.username.charAt(0).toUpperCase();
        const rankClass = rank <= 3 ? `rank-${rank}` : '';
        const currentUserClass = user.isCurrentUser ? 'current-user' : '';

        return `
            <div class="leaderboard-item ${currentUserClass}" data-user-id="${user.id}">
                <div class="rank-number ${rankClass}">${rank}</div>
                <div class="leaderboard-avatar">${avatar}</div>
                <div class="leaderboard-info">
                    <h3>
                        ${user.username}
                        ${user.isCurrentUser ? '<span class="current-user-badge">You</span>' : ''}
                    </h3>
                    <div class="leaderboard-stats">
                        <div class="leaderboard-stat">
                            <span class="stat-label">Level</span>
                            <span class="stat-value">${user.level}</span>
                        </div>
                        <div class="leaderboard-stat">
                            <span class="stat-label">XP</span>
                            <span class="stat-value">${user.xp}</span>
                        </div>
                        <div class="leaderboard-stat">
                            <span class="stat-label">Streak</span>
                            <span class="stat-value">${user.streakCount || 0}</span>
                        </div>
                        <div class="leaderboard-stat">
                            <span class="stat-label">Achievements</span>
                            <span class="stat-value">${user.achievementCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async performSearch() {
        const searchInput = document.getElementById('search-input');
        const query = searchInput.value.trim();
        
        if (!query || query.length < 2) {
            alert('Please enter at least 2 characters to search');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/friends/search?query=${encodeURIComponent(query)}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Search failed');

            const results = await response.json();
            this.renderSearchResults(results);

        } catch (error) {
            console.error('Error searching users:', error);
            alert('Search failed. Please try again.');
        }
    }

    renderSearchResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Users Found</h3>
                    <p>Try searching with a different username or email.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(user => this.createSearchResult(user)).join('');
    }

    createSearchResult(user) {
        const avatar = user.username.charAt(0).toUpperCase();
        const buttonClass = user.isFriend ? 'btn-pending' : 'btn-add-friend';
        const buttonText = user.isFriend ? 'Already Friends' : 'Add Friend';
        const buttonDisabled = user.isFriend || user.hasPendingRequest;

        return `
            <div class="search-result" data-user-id="${user.id}">
                <div class="search-result-info">
                    <div class="search-result-avatar">${avatar}</div>
                    <div class="search-result-details">
                        <h3>${user.username}</h3>
                        <p>Level ${user.level}</p>
                    </div>
                </div>
                
                <div class="search-result-actions">
                    <button class="${buttonClass}" 
                            ${buttonDisabled ? 'disabled' : ''} 
                            data-email="${user.email}">
                        ${user.hasPendingRequest ? 'Request Sent' : buttonText}
                    </button>
                </div>
            </div>
        `;
    }

    async sendFriendRequest(email) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ recipientEmail: email })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message);
            }

            showFriendNotification('Friend request sent successfully!');
            this.performSearch(); // Refresh search results

        } catch (error) {
            console.error('Error sending friend request:', error);
            alert(error.message || 'Failed to send friend request');
        }
    }

    async acceptRequest(requestId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/friends/accept/${requestId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to accept request');

            showFriendNotification('Friend request accepted!');
            await this.loadData(); // Refresh all data

        } catch (error) {
            console.error('Error accepting friend request:', error);
            alert('Failed to accept friend request');
        }
    }

    async declineRequest(requestId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/friends/decline/${requestId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to decline request');

            showFriendNotification('Friend request declined');
            await this.loadData(); // Refresh all data

        } catch (error) {
            console.error('Error declining friend request:', error);
            alert('Failed to decline friend request');
        }
    }

    async removeFriend(friendshipId) {
        if (!confirm('Are you sure you want to remove this friend?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/friends/${friendshipId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to remove friend');

            showFriendNotification('Friend removed successfully');
            await this.loadData(); // Refresh all data

        } catch (error) {
            console.error('Error removing friend:', error);
            alert('Failed to remove friend');
        }
    }

    async viewFriendProfile(friendId) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/friends/profile/${friendId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to load friend profile');

            const profile = await response.json();
            this.showFriendModal(profile);

        } catch (error) {
            console.error('Error loading friend profile:', error);
            alert('Failed to load friend profile');
        }
    }

    showFriendModal(profile) {
        const modal = document.getElementById('friend-modal');
        const modalName = document.getElementById('modal-friend-name');
        const modalLevel = document.getElementById('modal-level');
        const modalXp = document.getElementById('modal-xp');
        const modalStreak = document.getElementById('modal-streak');
        const modalAchievements = document.getElementById('modal-achievements');
        const modalActivities = document.getElementById('modal-activities');

        if (modal && modalName && modalLevel && modalXp && modalStreak && modalAchievements && modalActivities) {
            modalName.textContent = profile.username;
            modalLevel.textContent = profile.level;
            modalXp.textContent = profile.xp;
            modalStreak.textContent = profile.streakCount || 0;
            modalAchievements.textContent = profile.achievementCount;

            // Render recent activities
            modalActivities.innerHTML = profile.recentActivities.length > 0 
                ? profile.recentActivities.map(activity => `
                    <div class="activity-item">
                        <div class="activity-info">
                            <div class="activity-title">${activity.title}</div>
                            <div class="activity-meta">${activity.type} • ${new Date(activity.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div class="activity-duration">${activity.duration} min</div>
                    </div>
                `).join('')
                : '<p>No recent activities</p>';

            modal.style.display = 'block';
        }
    }

    hideModal() {
        const modal = document.getElementById('friend-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    updateStats() {
        // Update friend stats
        document.getElementById('total-friends').textContent = this.friends.length;
        document.getElementById('pending-requests').textContent = this.pendingRequests.length;

        // Update rank and top friend
        if (this.leaderboard.length > 0) {
            const currentUser = this.leaderboard.find(user => user.isCurrentUser);
            if (currentUser) {
                const rank = this.leaderboard.findIndex(user => user.isCurrentUser) + 1;
                document.getElementById('your-rank').textContent = `#${rank}`;
            }

            const topFriend = this.leaderboard.find(user => !user.isCurrentUser);
            if (topFriend) {
                document.getElementById('top-friend').textContent = topFriend.username;
            }
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

// Add this helper for friend notifications
function showFriendNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'friend-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <div class="notification-icon">🤝</div>
            <div class="notification-text">
                <h3>Friend Update</h3>
                <p>${message}</p>
            </div>
        </div>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2196F3 0%, #4CAF50 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 8px 25px rgba(33, 150, 243, 0.2);
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

// Initialize friends page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FriendsPage();
}); 