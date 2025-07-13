const mongoose = require('mongoose');

const friendSchema = new mongoose.Schema({
    // The user who sent the request
    requester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // The user who received the request
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Status: 'pending', 'accepted', 'declined', 'blocked'
    status: {
        type: String,
        enum: ['pending', 'accepted', 'declined', 'blocked'],
        default: 'pending'
    },
    // When the request was sent
    createdAt: {
        type: Date,
        default: Date.now
    },
    // When the request was responded to
    respondedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Ensure unique friend relationships
friendSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Virtual for checking if friendship is active
friendSchema.virtual('isActive').get(function() {
    return this.status === 'accepted';
});

// Static method to get all friends for a user
friendSchema.statics.getFriends = async function(userId) {
    const friendships = await this.find({
        $or: [
            { requester: userId, status: 'accepted' },
            { recipient: userId, status: 'accepted' }
        ]
    }).populate('requester', 'username email level xp streakCount unlockedAchievements')
      .populate('recipient', 'username email level xp streakCount unlockedAchievements');
    
    return friendships.map(friendship => {
        const friend = friendship.requester._id.equals(userId) 
            ? friendship.recipient 
            : friendship.requester;
        return {
            id: friend._id,
            username: friend.username,
            email: friend.email,
            level: friend.level,
            xp: friend.xp,
            streakCount: friend.streakCount,
            unlockedAchievements: friend.unlockedAchievements || [],
            friendshipId: friendship._id,
            createdAt: friendship.createdAt
        };
    });
};

// Static method to get pending requests for a user
friendSchema.statics.getPendingRequests = async function(userId) {
    return await this.find({
        recipient: userId,
        status: 'pending'
    }).populate('requester', 'username email level');
};

// Static method to check if two users are friends
friendSchema.statics.areFriends = async function(userId1, userId2) {
    const friendship = await this.findOne({
        $or: [
            { requester: userId1, recipient: userId2, status: 'accepted' },
            { requester: userId2, recipient: userId1, status: 'accepted' }
        ]
    });
    return !!friendship;
};

// Static method to check if there's a pending request
friendSchema.statics.hasPendingRequest = async function(requesterId, recipientId) {
    const request = await this.findOne({
        $or: [
            { requester: requesterId, recipient: recipientId, status: 'pending' },
            { requester: recipientId, recipient: requesterId, status: 'pending' }
        ]
    });
    return !!request;
};

const Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend; 