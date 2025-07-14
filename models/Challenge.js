const mongoose = require('mongoose');

const participantResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    progress: {
        type: Number,
        default: 0
    },
    finalScore: {
        type: Number,
        default: 0
    },
    finalProgress: {
        type: Number,
        default: 0
    },
    result: {
        type: String,
        enum: ['won', 'lost', 'completed'],
        default: 'completed'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

const challengeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    type: {
        type: String,
        required: true,
        enum: ['workouts', 'study_hours', 'work_hours', 'xp_earned', 'streak', 'variety']
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 30
    },
    reward: {
        type: Number,
        required: true,
        min: 50,
        max: 1000
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    invitedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['pending', 'active', 'completed', 'cancelled'],
        default: 'pending'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    participantResults: [participantResultSchema]
}, {
    timestamps: true
});

// Indexes for better query performance
challengeSchema.index({ participants: 1, status: 1 });
challengeSchema.index({ invitedUsers: 1, status: 1 });
challengeSchema.index({ endDate: 1, status: 1 });
challengeSchema.index({ creator: 1 });

// Virtual for checking if challenge is expired
challengeSchema.virtual('isExpired').get(function() {
    return new Date() > this.endDate;
});

// Virtual for checking if challenge is active
challengeSchema.virtual('isActive').get(function() {
    return this.status === 'active' && !this.isExpired;
});

// Method to get challenge progress for a specific user
challengeSchema.methods.getUserProgress = function(userId) {
    const result = this.participantResults.find(r => r.userId.equals(userId));
    return result || { score: 0, progress: 0 };
};

// Method to get leaderboard
challengeSchema.methods.getLeaderboard = function() {
    return this.participantResults
        .sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score))
        .map((result, index) => ({
            rank: index + 1,
            userId: result.userId,
            score: result.finalScore || result.score,
            progress: result.finalProgress || result.progress
        }));
};

// Static method to get active challenges for a user
challengeSchema.statics.getActiveChallenges = function(userId) {
    return this.find({
        participants: userId,
        status: 'active',
        endDate: { $gt: new Date() }
    }).populate('creator', 'username level')
      .populate('participants', 'username level')
      .sort({ createdAt: -1 });
};

// Static method to get pending invites for a user
challengeSchema.statics.getPendingInvites = function(userId) {
    return this.find({
        invitedUsers: userId,
        status: 'pending'
    }).populate('creator', 'username level')
      .populate('participants', 'username level')
      .sort({ createdAt: -1 });
};

// Static method to get completed challenges for a user
challengeSchema.statics.getCompletedChallenges = function(userId) {
    return this.find({
        participants: userId,
        status: 'completed'
    }).populate('creator', 'username')
      .populate('participants', 'username')
      .populate('winner', 'username')
      .sort({ endDate: -1 });
};

// Pre-save middleware to ensure creator is always a participant
challengeSchema.pre('save', function(next) {
    if (this.isNew && !this.participants.includes(this.creator)) {
        this.participants.push(this.creator);
    }
    next();
});

// Pre-save middleware to update challenge status
challengeSchema.pre('save', function(next) {
    // If all invited users have responded and there are participants, make it active
    if (this.status === 'pending' && this.invitedUsers.length === 0 && this.participants.length > 1) {
        this.status = 'active';
    }
    
    // If challenge has expired and is still active, mark as completed
    if (this.status === 'active' && this.isExpired) {
        this.status = 'completed';
    }
    
    next();
});

module.exports = mongoose.model('Challenge', challengeSchema); 