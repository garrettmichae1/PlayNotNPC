/**
 * Performance Monitoring Routes
 * Provides insights into database performance and cache statistics
 */

const express = require('express');
const router = express.Router();
const { queryMetrics, cacheManager } = require('../services/queryOptimizer');
const { checkDatabaseHealth } = require('../config/database');
const auth = require('../middleware/auth');

// Get performance metrics (admin only)
router.get('/metrics', auth, async (req, res) => {
    try {
        const dbHealth = await checkDatabaseHealth();
        const queryStats = queryMetrics.getStats();
        
        res.json({
            timestamp: new Date().toISOString(),
            database: dbHealth,
            cache: {
                size: queryStats.cacheSize,
                activeQueries: queryStats.activeQueries
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: process.cpuUsage()
            }
        });
    } catch (error) {
        console.error('Error fetching performance metrics:', error);
        res.status(500).json({ message: 'Error fetching performance metrics' });
    }
});

// Clear cache (admin only)
router.post('/cache/clear', auth, async (req, res) => {
    try {
        const cacheSize = cacheManager.size();
        cacheManager.clear();
        
        res.json({
            message: 'Cache cleared successfully',
            clearedItems: cacheSize,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error clearing cache:', error);
        res.status(500).json({ message: 'Error clearing cache' });
    }
});

// Get cache statistics
router.get('/cache/stats', auth, async (req, res) => {
    try {
        const stats = queryMetrics.getStats();
        
        res.json({
            cacheSize: stats.cacheSize,
            activeQueries: stats.activeQueries,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching cache stats:', error);
        res.status(500).json({ message: 'Error fetching cache statistics' });
    }
});

module.exports = router; 