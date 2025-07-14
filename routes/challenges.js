const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.js');
const User = require('../models/User.js');
const Friend = require('../models/Friend.js');
const Activity = require('../models/Activity.js');

// Challenge Schema (you'll need to create this model)
const Challenge = require('../models/Challenge.js');

// Get active challenges for the current user
router.get('/active', auth, async (req, res) => {
    try {
        const challenges = await Challenge.find({
            participants: req.user.userId,
            status: 'active',
            endDate: { $gt: new Date() }
        }).populate('creator', 'username level')
          .populate('participants', 'username level')
          .sort({ createdAt: -1 });

        res.json(challenges);
    } catch (error) {
        console.error('Error fetching active challenges:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get challenge invites for the current user
router.get('/invites', auth, async (req, res) => {
    try {
        const invites = await Challenge.find({
            invitedUsers: req.user.userId,
            status: 'pending'
        }).populate('creator', 'username level')
          .populate('participants', 'username level')
          .sort({ createdAt: -1 });

        res.json(invites);
    } catch (error) {
        console.error('Error fetching challenge invites:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get challenge history for the current user
router.get('/history', auth, async (req, res) => {
    try {
        const history = await Challenge.find({
            participants: req.user.userId,
            status: 'completed'
        }).populate('creator', 'username')
          .populate('participants', 'username')
          .populate('winner', 'username')
          .sort({ endDate: -1 });

        // Add user result for each challenge
        const historyWithResults = history.map(challenge => {
            const userResult = challenge.participantResults.find(
                result => result.userId.equals(req.user.userId)
            );
            
            return {
                ...challenge.toObject(),
                userScore: userResult ? userResult.score : 0,
                result: userResult ? userResult.result : 'completed'
            };
        });

        res.json(historyWithResults);
    } catch (error) {
        console.error('Error fetching challenge history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new challenge
router.post('/', auth, async (req, res) => {
    try {
        const { name, description, duration, type, reward, participants } = req.body;

        if (!name || !description || !duration || !type || !participants || participants.length === 0) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Verify all participants are friends
        for (const participantId of participants) {
            const areFriends = await Friend.areFriends(req.user.userId, participantId);
            if (!areFriends) {
                return res.status(400).json({ message: 'All participants must be your friends' });
            }
        }

        // Calculate end date
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + duration);

        // Create the challenge
        const challenge = new Challenge({
            name,
            description,
            duration,
            type,
            reward,
            creator: req.user.userId,
            participants: [req.user.userId, ...participants],
            invitedUsers: participants,
            status: 'pending',
            startDate: new Date(),
            endDate,
            participantResults: []
        });

        await challenge.save();

        // Send notifications to invited users (you can implement this later)
        // await sendChallengeInvites(challenge, participants);

        res.json({
            message: 'Challenge created successfully',
            challenge: challenge
        });

    } catch (error) {
        console.error('Error creating challenge:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Accept a challenge invite
router.put('/invites/:inviteId/accept', auth, async (req, res) => {
    try {
        const { inviteId } = req.params;

        const challenge = await Challenge.findById(inviteId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Check if user is invited
        if (!challenge.invitedUsers.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Not invited to this challenge' });
        }

        // Remove from invited users and add to participants
        challenge.invitedUsers = challenge.invitedUsers.filter(
            userId => !userId.equals(req.user.userId)
        );
        
        if (!challenge.participants.includes(req.user.userId)) {
            challenge.participants.push(req.user.userId);
        }

        // If all invited users have responded, start the challenge
        if (challenge.invitedUsers.length === 0) {
            challenge.status = 'active';
        }

        await challenge.save();

        res.json({ message: 'Challenge accepted successfully' });

    } catch (error) {
        console.error('Error accepting challenge:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Decline a challenge invite
router.put('/invites/:inviteId/decline', auth, async (req, res) => {
    try {
        const { inviteId } = req.params;

        const challenge = await Challenge.findById(inviteId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Check if user is invited
        if (!challenge.invitedUsers.includes(req.user.userId)) {
            return res.status(403).json({ message: 'Not invited to this challenge' });
        }

        // Remove from invited users
        challenge.invitedUsers = challenge.invitedUsers.filter(
            userId => !userId.equals(req.user.userId)
        );

        // If no more invited users, delete the challenge
        if (challenge.invitedUsers.length === 0 && challenge.participants.length === 1) {
            await Challenge.findByIdAndDelete(inviteId);
        } else {
            await challenge.save();
        }

        res.json({ message: 'Challenge declined successfully' });

    } catch (error) {
        console.error('Error declining challenge:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get challenge details
router.get('/:challengeId', auth, async (req, res) => {
    try {
        const { challengeId } = req.params;

        const challenge = await Challenge.findById(challengeId)
            .populate('creator', 'username level')
            .populate('participants', 'username level')
            .populate('winner', 'username');

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Check if user is a participant
        if (!challenge.participants.some(p => p._id.equals(req.user.userId))) {
            return res.status(403).json({ message: 'Not a participant in this challenge' });
        }

        // Calculate progress for each participant
        const challengeWithProgress = await this.calculateChallengeProgress(challenge);

        res.json(challengeWithProgress);

    } catch (error) {
        console.error('Error fetching challenge details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update challenge progress (called when user logs activities)
router.put('/:challengeId/progress', auth, async (req, res) => {
    try {
        const { challengeId } = req.params;

        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Check if user is a participant and challenge is active
        if (!challenge.participants.includes(req.user.userId) || challenge.status !== 'active') {
            return res.status(403).json({ message: 'Cannot update progress for this challenge' });
        }

        // Calculate user's progress based on challenge type
        const progress = await this.calculateUserProgress(req.user.userId, challenge);

        // Update or create participant result
        const existingResult = challenge.participantResults.find(
            result => result.userId.equals(req.user.userId)
        );

        if (existingResult) {
            existingResult.score = progress.score;
            existingResult.progress = progress.progress;
            existingResult.lastUpdated = new Date();
        } else {
            challenge.participantResults.push({
                userId: req.user.userId,
                score: progress.score,
                progress: progress.progress,
                lastUpdated: new Date()
            });
        }

        await challenge.save();

        res.json({ message: 'Progress updated successfully', progress });

    } catch (error) {
        console.error('Error updating challenge progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to calculate challenge progress
async function calculateChallengeProgress(challenge) {
    const challengeWithProgress = challenge.toObject();
    
    for (const participant of challengeWithProgress.participants) {
        const progress = await calculateUserProgress(participant._id, challenge);
        participant.progress = progress.progress;
        participant.score = progress.score;
    }

    return challengeWithProgress;
}

// Helper function to calculate user progress for a challenge
async function calculateUserProgress(userId, challenge) {
    const startDate = challenge.startDate;
    const endDate = challenge.endDate;

    // Get user's activities during the challenge period
    const activities = await Activity.find({
        userId: userId,
        createdAt: { $gte: startDate, $lte: endDate }
    });

    let score = 0;
    let progress = 0;

    switch (challenge.type) {
        case 'workouts':
            const workoutCount = activities.filter(a => a.type === 'WORKOUT').length;
            score = workoutCount;
            progress = Math.min((workoutCount / 20) * 100, 100); // Assume 20 workouts is 100%
            break;

        case 'study_hours':
            const studyActivities = activities.filter(a => a.type === 'STUDY');
            const studyHours = studyActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
            score = studyHours;
            progress = Math.min((studyHours / 50) * 100, 100); // Assume 50 hours is 100%
            break;

        case 'work_hours':
            const workActivities = activities.filter(a => a.type === 'WORK');
            const workHours = workActivities.reduce((sum, a) => sum + (a.duration || 0), 0);
            score = workHours;
            progress = Math.min((workHours / 80) * 100, 100); // Assume 80 hours is 100%
            break;

        case 'xp_earned':
            const totalXP = activities.reduce((sum, a) => sum + (a.xpEarned || 0), 0);
            score = totalXP;
            progress = Math.min((totalXP / 1000) * 100, 100); // Assume 1000 XP is 100%
            break;

        case 'streak':
            // Calculate current streak during challenge period
            const streak = calculateStreak(activities);
            score = streak;
            progress = Math.min((streak / 10) * 100, 100); // Assume 10 days is 100%
            break;

        case 'variety':
            const categories = new Set(activities.map(a => a.type));
            score = categories.size;
            progress = Math.min((categories.size / 3) * 100, 100); // 3 categories = 100%
            break;

        default:
            score = 0;
            progress = 0;
    }

    return { score, progress };
}

// Helper function to calculate streak
function calculateStreak(activities) {
    if (activities.length === 0) return 0;

    const sortedActivities = activities.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedActivities.length; i++) {
        const prevDate = new Date(sortedActivities[i - 1].createdAt);
        const currDate = new Date(sortedActivities[i].createdAt);
        const dayDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));

        if (dayDiff === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

// Complete expired challenges (this should be run by a cron job)
router.post('/complete-expired', auth, async (req, res) => {
    try {
        const expiredChallenges = await Challenge.find({
            status: 'active',
            endDate: { $lt: new Date() }
        });

        for (const challenge of expiredChallenges) {
            // Calculate final scores for all participants
            for (const participantId of challenge.participants) {
                const progress = await calculateUserProgress(participantId, challenge);
                
                const existingResult = challenge.participantResults.find(
                    result => result.userId.equals(participantId)
                );

                if (existingResult) {
                    existingResult.finalScore = progress.score;
                    existingResult.finalProgress = progress.progress;
                } else {
                    challenge.participantResults.push({
                        userId: participantId,
                        finalScore: progress.score,
                        finalProgress: progress.progress
                    });
                }
            }

            // Determine winner
            const sortedResults = challenge.participantResults.sort((a, b) => b.finalScore - a.finalScore);
            if (sortedResults.length > 0) {
                challenge.winner = sortedResults[0].userId;
                
                // Award XP to winner
                const winner = await User.findById(sortedResults[0].userId);
                if (winner) {
                    winner.xp += challenge.reward;
                    await winner.save();
                }
            }

            challenge.status = 'completed';
            await challenge.save();
        }

        res.json({ message: `Completed ${expiredChallenges.length} challenges` });

    } catch (error) {
        console.error('Error completing expired challenges:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 