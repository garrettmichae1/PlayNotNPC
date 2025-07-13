import { Auth } from './modules/auth.js';

class AnalyticsManager {
    constructor() {
        this.currentRange = 7;
        this.activityChart = null;
        this.timeSeriesChart = null;
        this.activities = [];
        this.init();
    }

    async init() {
        // Check authentication
        if (!Auth.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        // Test if Chart.js is available
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            return;
        }
        console.log('Chart.js is loaded successfully');

        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadData();
        
        // Update user stats
        this.updateUserStats();
    }

    setupEventListeners() {
        // Time range buttons
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentRange = e.target.dataset.range;
                this.loadData();
            });
        });

        // Chart type buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = e.target.closest('.chart-container');
                container.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChartType(container, e.target.dataset.chart);
            });
        });

        // Breakdown type selector
        document.getElementById('breakdown-type').addEventListener('change', (e) => {
            this.updateBreakdown(e.target.value);
        });

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

            // Fetch activities with date filter - request all activities for analytics
            const dateFilter = this.getDateFilter();
            const url = dateFilter ? `/api/activities?startDate=${dateFilter}&limit=1000` : '/api/activities?limit=1000';
            
            console.log('Fetching analytics data from:', url);
            
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                console.error('Failed to fetch activities:', response.status, response.statusText);
                throw new Error('Failed to fetch activities');
            }
            
            const data = await response.json();
            console.log('Analytics data loaded:', data);
            console.log('Response structure:', {
                isArray: Array.isArray(data),
                hasActivities: data && data.activities,
                activitiesLength: data && data.activities ? data.activities.length : 'N/A'
            });
            
            // Handle both array and object responses
            if (Array.isArray(data)) {
                this.activities = data;
            } else if (data.activities && Array.isArray(data.activities)) {
                this.activities = data.activities;
            } else if (data && typeof data === 'object') {
                // If it's an object but doesn't have activities array, try to extract activities
                console.warn('Unexpected data structure, attempting to extract activities:', data);
                this.activities = [];
            } else {
                console.error('Unexpected data structure:', data);
                this.activities = [];
            }
            
            console.log('Processed activities:', this.activities.length, 'activities');
            
            // If no activities found and we're using date filtering, try without filter as fallback
            if (this.activities.length === 0 && this.currentRange !== 'all') {
                console.log('No activities found with date filter, trying without filter...');
                const fallbackUrl = '/api/activities?limit=1000';
                try {
                    const fallbackResponse = await fetch(fallbackUrl, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (fallbackResponse.ok) {
                        const fallbackData = await fallbackResponse.json();
                        if (Array.isArray(fallbackData)) {
                            this.activities = fallbackData;
                        } else if (fallbackData.activities && Array.isArray(fallbackData.activities)) {
                            this.activities = fallbackData.activities;
                        }
                        console.log('Fallback activities loaded:', this.activities.length, 'activities');
                    }
                } catch (fallbackError) {
                    console.error('Fallback data loading failed:', fallbackError);
                }
            }
            
            this.updateAnalytics();
        } catch (error) {
            console.error('Error loading analytics data:', error);
            this.showErrorState();
        }
    }

    showLoadingState() {
        const chartContainers = document.querySelectorAll('.chart-container');
        const breakdownContent = document.getElementById('breakdown-content');
        
        chartContainers.forEach(container => {
            const canvas = container.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'none';
            }
            container.innerHTML += '<div id="loading-' + container.id + '" style="text-align: center; padding: 40px; color: #666; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Loading...</div>';
        });
        
        if (breakdownContent) {
            breakdownContent.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Loading...</div>';
        }
    }

    hideLoadingState() {
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            const loadingDiv = container.querySelector('[id^="loading-"]');
            if (loadingDiv) {
                loadingDiv.remove();
            }
            const canvas = container.querySelector('canvas');
            if (canvas) {
                canvas.style.display = 'block';
            }
        });
    }

    showErrorState() {
        const containers = document.querySelectorAll('.chart-container, .breakdown-content');
        containers.forEach(container => {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: #ff6b6b;">Failed to load data. Please try again.</div>';
        });
    }

    getDateFilter() {
        if (this.currentRange === 'all') return null;
        
        const days = parseInt(this.currentRange);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const dateString = startDate.toISOString().split('T')[0];
        
        console.log(`Date filter for ${this.currentRange} days: ${dateString}`);
        return dateString;
    }

    updateAnalytics() {
        this.updateSummaryCards();
        this.updateActivityChart();
        this.updateTimeSeriesChart();
        this.updateBreakdown('category');
    }

    updateSummaryCards() {
        if (!this.activities || !Array.isArray(this.activities)) {
            console.error('Activities is not an array:', this.activities);
            this.activities = [];
        }
        
        const totalXp = this.activities.reduce((sum, activity) => sum + (activity.xpEarned || 0), 0);
        const totalTime = this.activities.reduce((sum, activity) => sum + (activity.duration || 0), 0);
        const totalActivities = this.activities.length;
        const avgDailyXp = this.currentRange === 'all' ? 
            Math.round(totalXp / Math.max(1, this.activities.length)) : 
            Math.round(totalXp / parseInt(this.currentRange));

        document.getElementById('total-xp').textContent = totalXp.toLocaleString();
        document.getElementById('total-time').textContent = this.formatTime(totalTime);
        document.getElementById('total-activities').textContent = totalActivities;
        document.getElementById('avg-daily-xp').textContent = avgDailyXp;
    }

    formatTime(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    updateActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) {
            console.error('Activity chart canvas not found');
            return;
        }

        console.log('Updating activity chart with', this.activities.length, 'activities');

        // Destroy existing chart
        if (this.activityChart) {
            this.activityChart.destroy();
        }

        // Ensure activities is an array
        if (!this.activities || !Array.isArray(this.activities)) {
            console.error('Activities is not an array in updateActivityChart:', this.activities);
            this.activities = [];
        }

        // Group activities by type
        const categoryData = {};
        this.activities.forEach(activity => {
            const type = activity.type || 'OTHER';
            if (!categoryData[type]) {
                categoryData[type] = { xp: 0, time: 0, count: 0 };
            }
            categoryData[type].xp += activity.xpEarned || 0;
            categoryData[type].time += activity.duration || 0;
            categoryData[type].count += 1;
        });

        const labels = Object.keys(categoryData);
        const data = labels.map(type => categoryData[type].xp);
        
        console.log('Activity chart data:', { labels, data, categoryData });

        // Create chart with better error handling
        try {
            if (labels.length === 0 || data.length === 0) {
                console.log('No data available for activity chart');
                ctx.style.display = 'none';
                return;
            }
            
            ctx.style.display = 'block';
            this.activityChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
                        ],
                        borderWidth: 3,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            console.log('Activity chart created successfully');
        } catch (error) {
            console.error('Error creating activity chart:', error);
            ctx.style.display = 'none';
        }
    }

    updateTimeSeriesChart() {
        const ctx = document.getElementById('timeSeriesChart');
        if (!ctx) {
            console.error('Time series chart canvas not found');
            return;
        }

        console.log('Updating time series chart with', this.activities.length, 'activities');

        // Destroy existing chart
        if (this.timeSeriesChart) {
            this.timeSeriesChart.destroy();
        }

        // Ensure activities is an array
        if (!this.activities || !Array.isArray(this.activities)) {
            console.error('Activities is not an array in updateTimeSeriesChart:', this.activities);
            this.activities = [];
        }

        // Group activities by date
        const dailyData = {};
        this.activities.forEach(activity => {
            const date = new Date(activity.date || activity.createdAt).toLocaleDateString();
            if (!dailyData[date]) {
                dailyData[date] = 0;
            }
            dailyData[date] += activity.xpEarned || 0;
        });

        const dates = Object.keys(dailyData).sort();
        const xpData = dates.map(date => dailyData[date]);
        
        console.log('Time series chart data:', { dates, xpData, dailyData });

        // Create chart with better error handling
        try {
            if (dates.length === 0 || xpData.length === 0) {
                console.log('No data available for time series chart');
                ctx.style.display = 'none';
                return;
            }
            
            ctx.style.display = 'block';
            this.timeSeriesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: 'Daily XP',
                        data: xpData,
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                        borderWidth: 3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
            console.log('Time series chart created successfully');
        } catch (error) {
            console.error('Error creating time series chart:', error);
            ctx.style.display = 'none';
        }
    }

    updateChartType(container, chartType) {
        const canvas = container.querySelector('canvas');
        const chart = container.id === 'activityChart' ? this.activityChart : this.timeSeriesChart;
        
        if (chart) {
            chart.config.type = chartType;
            chart.update();
        }
    }

    updateBreakdown(type) {
        const container = document.getElementById('breakdown-content');
        
        switch (type) {
            case 'category':
                this.renderCategoryBreakdown(container);
                break;
            case 'daily':
                this.renderDailyBreakdown(container);
                break;
            case 'weekly':
                this.renderWeeklyBreakdown(container);
                break;
        }
    }

    renderCategoryBreakdown(container) {
        // Ensure activities is an array
        if (!this.activities || !Array.isArray(this.activities)) {
            console.error('Activities is not an array in renderCategoryBreakdown:', this.activities);
            this.activities = [];
        }
        
        const categoryData = {};
        this.activities.forEach(activity => {
            const type = activity.type || 'OTHER';
            if (!categoryData[type]) {
                categoryData[type] = { xp: 0, time: 0, count: 0 };
            }
            categoryData[type].xp += activity.xpEarned || 0;
            categoryData[type].time += activity.duration || 0;
            categoryData[type].count += 1;
        });

        const icons = {
            'WORKOUT': '💪',
            'WORK': '💼',
            'STUDY': '📚',
            'OTHER': '📝'
        };

        const colors = {
            'WORKOUT': 'workout',
            'WORK': 'work',
            'STUDY': 'study',
            'OTHER': 'workout'
        };

        container.innerHTML = Object.entries(categoryData)
            .map(([type, data]) => `
                <div class="category-item">
                    <div class="category-info">
                        <div class="category-icon ${colors[type]}">${icons[type]}</div>
                        <div class="category-details">
                            <h4>${type}</h4>
                            <p>${data.count} activities</p>
                        </div>
                    </div>
                    <div class="category-stats">
                        <div class="stat-value">${data.xp} XP</div>
                        <div class="stat-label">${this.formatTime(data.time)}</div>
                    </div>
                </div>
            `).join('');
    }

    renderDailyBreakdown(container) {
        // Ensure activities is an array
        if (!this.activities || !Array.isArray(this.activities)) {
            console.error('Activities is not an array in renderDailyBreakdown:', this.activities);
            this.activities = [];
        }
        
        const dailyData = {};
        this.activities.forEach(activity => {
            const date = new Date(activity.date || activity.createdAt).toLocaleDateString();
            if (!dailyData[date]) {
                dailyData[date] = { xp: 0, time: 0, count: 0 };
            }
            dailyData[date].xp += activity.xpEarned || 0;
            dailyData[date].time += activity.duration || 0;
            dailyData[date].count += 1;
        });

        const sortedDates = Object.keys(dailyData).sort().reverse();

        container.innerHTML = `
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>XP Earned</th>
                        <th>Time Spent</th>
                        <th>Activities</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedDates.map(date => `
                        <tr>
                            <td>${date}</td>
                            <td>${dailyData[date].xp} XP</td>
                            <td>${this.formatTime(dailyData[date].time)}</td>
                            <td>${dailyData[date].count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    renderWeeklyBreakdown(container) {
        // Ensure activities is an array
        if (!this.activities || !Array.isArray(this.activities)) {
            console.error('Activities is not an array in renderWeeklyBreakdown:', this.activities);
            this.activities = [];
        }
        
        const weeklyData = {};
        this.activities.forEach(activity => {
            const date = new Date(activity.date || activity.createdAt);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toLocaleDateString();
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { xp: 0, time: 0, count: 0 };
            }
            weeklyData[weekKey].xp += activity.xpEarned || 0;
            weeklyData[weekKey].time += activity.duration || 0;
            weeklyData[weekKey].count += 1;
        });

        const sortedWeeks = Object.keys(weeklyData).sort().reverse();

        container.innerHTML = `
            <table class="breakdown-table">
                <thead>
                    <tr>
                        <th>Week Starting</th>
                        <th>XP Earned</th>
                        <th>Time Spent</th>
                        <th>Activities</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedWeeks.map(week => `
                        <tr>
                            <td>${week}</td>
                            <td>${weeklyData[week].xp} XP</td>
                            <td>${this.formatTime(weeklyData[week].time)}</td>
                            <td>${weeklyData[week].count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
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

// Initialize analytics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnalyticsManager();
}); 