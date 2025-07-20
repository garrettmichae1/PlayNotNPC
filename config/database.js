/**
 * Database Configuration
 * Optimized MongoDB connection with pooling and performance settings
 */

const mongoose = require('mongoose');

// Database configuration options
const dbConfig = {
    // Connection pooling settings
    maxPoolSize: 10, // Maximum number of connections in the pool
    minPoolSize: 2,  // Minimum number of connections in the pool
    maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    
    // Performance optimizations
    // bufferCommands: true, // Removed unsupported option
    // bufferMaxEntries: 0,   // Removed unsupported option
    
    // Connection timeout settings
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000,         // Socket timeout
    connectTimeoutMS: 10000,        // Connection timeout
    
    // Write concern settings
    writeConcern: {
        w: 'majority',
        j: true,
        wtimeout: 10000
    },
    
    // Read preference
    readPreference: 'primaryPreferred',
    
    // Retry settings
    retryWrites: true,
    retryReads: true,
    
    // Compression
    compressors: ['zlib'],
    zlibCompressionLevel: 6
};

// Connection event handlers
const setupConnectionHandlers = () => {
    mongoose.connection.on('connected', () => {
        console.log('MongoDB Connected Successfully!');
        console.log(`Connection Pool Size: ${mongoose.connection.pool.size}`);
    });

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB Connection Error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('MongoDB Disconnected');
    });

    mongoose.connection.on('reconnected', () => {
        console.log('MongoDB Reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        } catch (err) {
            console.error('Error during graceful shutdown:', err);
            process.exit(1);
        }
    });
};

// Connect to MongoDB with optimized settings
const connectDB = async () => {
    try {
        console.log('Attempting to connect to MongoDB...');
        
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is not defined');
        }

        await mongoose.connect(mongoURI, dbConfig);
        
        // Setup connection event handlers
        setupConnectionHandlers();
        
        // Create database indexes for performance
        await createDatabaseIndexes();
        
        console.log('Database indexes created successfully');
        
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

// Create optimized database indexes
const createDatabaseIndexes = async () => {
    try {
        // Wait for connection to be ready
        if (mongoose.connection.readyState !== 1) {
            console.log('⏳ Waiting for database connection...');
            await new Promise(resolve => {
                mongoose.connection.once('connected', resolve);
            });
        }
        
        // User indexes
        await mongoose.model('User').createIndexes();
        
        // Activity indexes for better query performance
        const Activity = mongoose.model('Activity');
        await Activity.collection.createIndex({ userId: 1, createdAt: -1 });
        await Activity.collection.createIndex({ category: 1, userId: 1 });
        await Activity.collection.createIndex({ xp: -1, userId: 1 });
        
        console.log('Database indexes created successfully');
        
    } catch (error) {
        console.error('Error creating database indexes:', error);
        throw error;
    }
};

// Health check function
const checkDatabaseHealth = async () => {
    try {
        const status = mongoose.connection.readyState;
        const poolSize = mongoose.connection.pool.size;
        const poolUsed = mongoose.connection.pool.used;
        
        return {
            status: status === 1 ? 'connected' : 'disconnected',
            poolSize,
            poolUsed,
            healthy: status === 1
        };
    } catch (error) {
        return {
            status: 'error',
            error: error.message,
            healthy: false
        };
    }
};

module.exports = {
    connectDB,
    checkDatabaseHealth,
    createDatabaseIndexes
}; 
