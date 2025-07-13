class XPService {
    static calculateXP(activity) {
        let baseXP = activity.duration;  // 1 XP per minute as base
        
        // Intensity multipliers
        const intensityMultipliers = {
            'LOW': 0.8,
            'MEDIUM': 1,
            'HIGH': 1.5
        };

        // Activity type multipliers
        const typeMultipliers = {
            'WORKOUT': 1.2,  // Encourage physical activity
            'STUDY': 1.1,    // Encourage learning
            'WORK': 1        // Base multiplier for work
        };

        // Calculate final XP
        let finalXP = Math.round(
            baseXP * 
            intensityMultipliers[activity.intensity] * 
            typeMultipliers[activity.type]
        );

        // Bonus XP for longer activities (over 30 minutes)
        if (activity.duration >= 30) {
            finalXP = Math.round(finalXP * 1.1);  // 10% bonus
        }

        return finalXP;
    }

    static calculateLevelProgress(currentXP, currentLevel) {
        const baseXPForNextLevel = 100;  // Base XP needed for first level
        const xpScalingFactor = 1.5;     // How much more XP each level needs

        // Calculate XP needed for next level
        const xpNeeded = Math.round(
            baseXPForNextLevel * Math.pow(xpScalingFactor, currentLevel - 1)
        );

        // Calculate progress percentage
        const progress = (currentXP / xpNeeded) * 100;

        return {
            currentXP,
            xpNeeded,
            progress: Math.min(100, progress),
            remainingXP: Math.max(0, xpNeeded - currentXP)
        };
    }

    static checkLevelUp(user) {
        const progress = this.calculateLevelProgress(user.xp, user.level);
        
        if (user.xp >= progress.xpNeeded) {
            // Level up!
            user.level += 1;
            user.xp -= progress.xpNeeded;
            
            return {
                leveledUp: true,
                newLevel: user.level,
                newXP: user.xp,
                message: `Congratulations! You've reached level ${user.level}!`
            };
        }

        return {
            leveledUp: false,
            currentLevel: user.level,
            currentXP: user.xp
        };
    }

    static checkAchievements(user, activity) {
        const newAchievements = [];

        // Check workout streak
        if (activity.type === 'WORKOUT') {
            if (user.stats.totalWorkouts === 10) {
                newAchievements.push({
                    name: 'Workout Warrior',
                    description: 'Complete 10 workouts'
                });
            }
        }

        // Check study milestones
        if (activity.type === 'STUDY') {
            if (user.stats.totalStudyHours >= 50) {
                newAchievements.push({
                    name: 'Scholar',
                    description: 'Study for 50 hours'
                });
            }
        }

        // Check total XP milestones
        const totalXPMilestones = [1000, 5000, 10000, 50000];
        for (const milestone of totalXPMilestones) {
            if (user.totalXP >= milestone && !user.achievements.find(a => a.name === `XP Master ${milestone}`)) {
                newAchievements.push({
                    name: `XP Master ${milestone}`,
                    description: `Earn ${milestone} total XP`
                });
            }
        }

        return newAchievements;
    }
}

module.exports = XPService;
