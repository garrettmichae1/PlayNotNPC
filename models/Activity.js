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
        enum: ['WORKOUT', 'WORK', 'STUDY']
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
