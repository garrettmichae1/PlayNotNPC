/**
 * Query Optimization Service
 * Provides optimized database queries with caching and performance monitoring
 */

const Activity = require('../models/Activity');
const User = require('../models/User');

// Simple in-memory cache (in production, use Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cache management
const cacheManager = {
    set: (key, value, ttl = CACHE_TTL) => {
        cache.set(key, {
            value,
            expiry: Date.now() + ttl
        });
    },
    
    get: (key) => {
        const item = cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expiry) {
            cache.delete(key);
            return null;
        }
        
        return item.value;
    },
    
    clear: () => cache.clear(),
    
    size: () => cache.size
};

// Query performance monitoring
const queryMetrics = {
    queries: new Map(),
    
    start: (queryName) => {
        queryMetrics.queries.set(queryName, Date.now());
    },
    
    end: (queryName) => {
        const startTime = queryMetrics.queries.get(queryName);
        if (startTime) {
            const duration = Date.now() - startTime;
            queryMetrics.queries.delete(queryName);
            return duration;
        }
        return 0;
    },
    
    getStats: () => {
        return {
            cacheSize: cacheManager.size(),
            activeQueries: queryMetrics.queries.size
        };
    }
};

// Optimized user queries
const userQueries = {
    // Get user stats with caching
    getUserStats: async (userId) => {
        const cacheKey = `user_stats_${userId}`;
        const cached = cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        queryMetrics.start('getUserStats');
        
        try {
            const user = await User.findById(userId)
                .select('level xp totalXP streakCount')
                .lean()
                .exec();
            
            const duration = queryMetrics.end('getUserStats');
            console.log(`📊 getUserStats query completed in ${duration}ms`);
            
            cacheManager.set(cacheKey, user);
            return user;
            
        } catch (error) {
            queryMetrics.end('getUserStats');
            throw error;
        }
    },
    
    // Get user with activities count
    getUserWithActivityCount: async (userId) => {
        const cacheKey = `user_activities_${userId}`;
        const cached = cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        queryMetrics.start('getUserWithActivityCount');
        
        try {
            const [user, activityCount] = await Promise.all([
                User.findById(userId).lean().exec(),
                Activity.countDocuments({ userId }).exec()
            ]);
            
            const result = { ...user, activityCount };
            const duration = queryMetrics.end('getUserWithActivityCount');
            console.log(`📊 getUserWithActivityCount query completed in ${duration}ms`);
            
            cacheManager.set(cacheKey, result, 2 * 60 * 1000); // 2 minutes cache
            return result;
            
        } catch (error) {
            queryMetrics.end('getUserWithActivityCount');
            throw error;
        }
    }
};

// Optimized activity queries
const activityQueries = {
    // Get user activities with pagination and filtering
    getUserActivities: async (userId, options = {}) => {
        const {
            page = 1,
            limit = 10,
            category = null,
            startDate = null,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = options;
        
        const cacheKey = `activities_${userId}_${page}_${limit}_${category}_${startDate}_${sortBy}_${sortOrder}`;
        const cached = cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        queryMetrics.start('getUserActivities');
        
        try {
            // Build query
            const query = { userId };
            if (category) {
                query.type = category; // Use 'type' field for category filtering
            }
            if (startDate) {
                query.createdAt = { $gte: new Date(startDate) };
                console.log(`📊 Date filtering: ${startDate} -> ${new Date(startDate)}`);
            }
            
            console.log(`📊 Query built:`, query);
            
            // Build sort object
            const sort = {};
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
            
            // Execute query with pagination
            const [activities, total] = await Promise.all([
                Activity.find(query)
                    .sort(sort)
                    .skip((page - 1) * limit)
                    .limit(limit)
                    .lean()
                    .exec(),
                Activity.countDocuments(query).exec()
            ]);
            
            const result = {
                activities,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            };
            
            const duration = queryMetrics.end('getUserActivities');
            console.log(`📊 getUserActivities query completed in ${duration}ms`);
            console.log(`📊 Found ${activities.length} activities out of ${total} total`);
            
            cacheManager.set(cacheKey, result, 1 * 60 * 1000); // 1 minute cache
            return result;
            
        } catch (error) {
            queryMetrics.end('getUserActivities');
            throw error;
        }
    },
    
    // Get activity statistics
    getActivityStats: async (userId) => {
        const cacheKey = `activity_stats_${userId}`;
        const cached = cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        queryMetrics.start('getActivityStats');
        
        try {
            const stats = await Activity.aggregate([
                { $match: { userId: userId } },
                {
                    $group: {
                        _id: null,
                        totalActivities: { $sum: 1 },
                        totalXP: { $sum: '$xp' },
                        avgXP: { $avg: '$xp' },
                        categories: { $addToSet: '$category' }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        totalActivities: 1,
                        totalXP: 1,
                        avgXP: { $round: ['$avgXP', 2] },
                        categories: 1
                    }
                }
            ]).exec();
            
            const result = stats[0] || {
                totalActivities: 0,
                totalXP: 0,
                avgXP: 0,
                categories: []
            };
            
            const duration = queryMetrics.end('getActivityStats');
            console.log(`📊 getActivityStats query completed in ${duration}ms`);
            
            cacheManager.set(cacheKey, result, 3 * 60 * 1000); // 3 minutes cache
            return result;
            
        } catch (error) {
            queryMetrics.end('getActivityStats');
            throw error;
        }
    },
    
    // Get recent activities for dashboard
    getRecentActivities: async (userId, limit = 5) => {
        const cacheKey = `recent_activities_${userId}_${limit}`;
        const cached = cacheManager.get(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        queryMetrics.start('getRecentActivities');
        
        try {
            const activities = await Activity.find({ userId })
                .sort({ createdAt: -1 })
                .limit(limit)
                .select('title category xp createdAt')
                .lean()
                .exec();
            
            const duration = queryMetrics.end('getRecentActivities');
            console.log(`📊 getRecentActivities query completed in ${duration}ms`);
            
            cacheManager.set(cacheKey, activities, 30 * 1000); // 30 seconds cache
            return activities;
            
        } catch (error) {
            queryMetrics.end('getRecentActivities');
            throw error;
        }
    }
};

// Cache invalidation
const invalidateCache = {
    user: (userId) => {
        const patterns = [
            `user_stats_${userId}`,
            `user_activities_${userId}`,
            `activity_stats_${userId}`,
            `recent_activities_${userId}`
        ];
        
        patterns.forEach(pattern => {
            for (const key of cache.keys()) {
                if (key.includes(pattern)) {
                    cache.delete(key);
                }
            }
        });
    },
    
    activities: (userId) => {
        const patterns = [
            `activities_${userId}`,
            `activity_stats_${userId}`,
            `recent_activities_${userId}`
        ];
        
        patterns.forEach(pattern => {
            for (const key of cache.keys()) {
                if (key.includes(pattern)) {
                    cache.delete(key);
                }
            }
        });
    },
    
    all: () => cacheManager.clear()
};

module.exports = {
    userQueries,
    activityQueries,
    cacheManager,
    queryMetrics,
    invalidateCache
}; 