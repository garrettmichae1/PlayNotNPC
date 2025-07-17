const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true,
        // Allow both predefined types and custom types
        validate: {
            validator: function(v) {
                // Allow predefined types or custom types (non-empty strings)
                const predefinedTypes = ['WORKOUT', 'WORK', 'STUDY'];
                return predefinedTypes.includes(v) || (typeof v === 'string' && v.trim().length > 0);
            },
            message: 'Activity type must be either a predefined type (WORKOUT, WORK, STUDY) or a custom activity name'
        }
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    duration: {
        type: Number,  // in minutes
        required: true
    },
    intensity: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    xpEarned: {
        type: Number,
        required: true
    },
    completed: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tags: [{
        type: String
    }],
    metrics: {
        calories: Number,
        distance: Number,  // in kilometers
        weight: Number,    // in kg
        sets: Number,
        reps: Number
    }
});

module.exports = mongoose.model('Activity', activitySchema);
