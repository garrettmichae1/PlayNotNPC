const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const User = require('../models/User.js');
const Friend = require('../models/Friend.js');
const Activity = require('../models/Activity.js');

// Get all friends for the current user
router.get('/', auth, async (req, res) => {
    try {
        const friends = await Friend.getFriends(req.user.userId);
        res.json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending friend requests
router.get('/requests', auth, async (req, res) => {
    try {
        const pendingRequests = await Friend.getPendingRequests(req.user.userId);
        res.json(pendingRequests);
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Send a friend request
router.post('/request', auth, async (req, res) => {
    try {
        const { recipientEmail } = req.body;
        
        if (!recipientEmail) {
            return res.status(400).json({ message: 'Recipient email is required' });
        }

        // Find the recipient user
        const recipient = await User.findOne({ email: recipientEmail.toLowerCase() });
        if (!recipient) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Can't send request to yourself
        if (recipient._id.equals(req.user.userId)) {
            return res.status(400).json({ message: 'Cannot send friend request to yourself' });
        }

        // Check if already friends
        const areFriends = await Friend.areFriends(req.user.userId, recipient._id);
        if (areFriends) {
            return res.status(400).json({ message: 'Already friends with this user' });
        }

        // Check if there's already a pending request
        const hasPending = await Friend.hasPendingRequest(req.user.userId, recipient._id);
        if (hasPending) {
            return res.status(400).json({ message: 'Friend request already pending' });
        }

        // Create the friend request
        const friendRequest = new Friend({
            requester: req.user.userId,
            recipient: recipient._id,
            status: 'pending'
        });

        await friendRequest.save();

        res.json({ 
            message: 'Friend request sent successfully',
            requestId: friendRequest._id
        });

    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept a friend request
router.put('/accept/:requestId', auth, async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const friendRequest = await Friend.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        // Ensure the current user is the recipient
        if (!friendRequest.recipient.equals(req.user.userId)) {
            return res.status(403).json({ message: 'Not authorized to accept this request' });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        friendRequest.status = 'accepted';
        friendRequest.respondedAt = new Date();
        await friendRequest.save();

        res.json({ message: 'Friend request accepted successfully' });

    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Decline a friend request
router.put('/decline/:requestId', auth, async (req, res) => {
    try {
        const { requestId } = req.params;
        
        const friendRequest = await Friend.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        // Ensure the current user is the recipient
        if (!friendRequest.recipient.equals(req.user.userId)) {
            return res.status(403).json({ message: 'Not authorized to decline this request' });
        }

        if (friendRequest.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        friendRequest.status = 'declined';
        friendRequest.respondedAt = new Date();
        await friendRequest.save();

        res.json({ message: 'Friend request declined successfully' });

    } catch (error) {
        console.error('Error declining friend request:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove a friend
router.delete('/:friendshipId', auth, async (req, res) => {
    try {
        const { friendshipId } = req.params;
        
        const friendship = await Friend.findById(friendshipId);
        if (!friendship) {
            return res.status(404).json({ message: 'Friendship not found' });
        }

        // Ensure the current user is part of this friendship
        if (!friendship.requester.equals(req.user.userId) && 
            !friendship.recipient.equals(req.user.userId)) {
            return res.status(403).json({ message: 'Not authorized to remove this friendship' });
        }

        await Friend.findByIdAndDelete(friendshipId);

        res.json({ message: 'Friend removed successfully' });

    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get friend's profile (public info only)
router.get('/profile/:friendId', auth, async (req, res) => {
    try {
        const { friendId } = req.params;
        
        // Check if they are friends
        const areFriends = await Friend.areFriends(req.user.userId, friendId);
        if (!areFriends) {
            return res.status(403).json({ message: 'Not friends with this user' });
        }

        // Get friend's public profile
        const friend = await User.findById(friendId)
            .select('username level xp streakCount unlockedAchievements createdAt');
        
        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get friend's recent activities (last 10)
        const recentActivities = await Activity.find({ userId: friendId })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('type title duration createdAt');

        // Get friend's achievement count
        const achievementCount = friend.unlockedAchievements ? friend.unlockedAchievements.length : 0;

        const profile = {
            id: friend._id,
            username: friend.username,
            level: friend.level,
            xp: friend.xp,
            streakCount: friend.streakCount,
            achievementCount: achievementCount,
            memberSince: friend.createdAt,
            recentActivities: recentActivities
        };

        res.json(profile);

    } catch (error) {
        console.error('Error fetching friend profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search for users to add as friends
router.get('/search', auth, async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({ message: 'Search query must be at least 2 characters' });
        }

        // Search by username or email
        const users = await User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ],
            _id: { $ne: req.user.userId } // Exclude current user
        }).select('username email level')
          .limit(10);

        // Check friendship status for each user
        const results = await Promise.all(users.map(async (user) => {
            const areFriends = await Friend.areFriends(req.user.userId, user._id);
            const hasPending = await Friend.hasPendingRequest(req.user.userId, user._id);
            
            return {
                id: user._id,
                username: user.username,
                email: user.email,
                level: user.level,
                isFriend: areFriends,
                hasPendingRequest: hasPending
            };
        }));

        res.json(results);

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get friends leaderboard
router.get('/leaderboard', auth, async (req, res) => {
    try {
        const friends = await Friend.getFriends(req.user.userId);
        
        // Add current user to the list
        const currentUser = await User.findById(req.user.userId)
            .select('username level xp streakCount unlockedAchievements');
        
        const allUsers = [
            {
                id: currentUser._id,
                username: currentUser.username,
                level: currentUser.level,
                xp: currentUser.xp,
                streakCount: currentUser.streakCount,
                achievementCount: currentUser.unlockedAchievements ? currentUser.unlockedAchievements.length : 0,
                isCurrentUser: true
            },
            ...friends.map(friend => ({
                id: friend.id,
                username: friend.username,
                level: friend.level,
                xp: friend.xp,
                streakCount: friend.streakCount,
                achievementCount: friend.unlockedAchievements.length,
                isCurrentUser: false
            }))
        ];

        // Sort by level (descending), then by XP (descending)
        allUsers.sort((a, b) => {
            if (b.level !== a.level) {
                return b.level - a.level;
            }
            return b.xp - a.xp;
        });

        res.json(allUsers);

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 