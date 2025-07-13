class AchievementManager {
    constructor() {
        this.achievements = this.initializeAchievements();
    }

    initializeAchievements() {
        return {
            // Milestone Achievements
            milestones: {
                level5: {
                    id: 'level5',
                    title: 'Getting Started',
                    description: 'Reach Level 5',
                    icon: '⭐',
                    xpReward: 50,
                    unlocked: false
                },
                level10: {
                    id: 'level10',
                    title: 'Dedicated Learner',
                    description: 'Reach Level 10',
                    icon: '🌟',
                    xpReward: 100,
                    unlocked: false
                },
                level25: {
                    id: 'level25',
                    title: 'Experience Master',
                    description: 'Reach Level 25',
                    icon: '💎',
                    xpReward: 250,
                    unlocked: false
                },
                level50: {
                    id: 'level50',
                    title: 'Halfway Hero',
                    description: 'Reach Level 50',
                    icon: '👑',
                    xpReward: 500,
                    unlocked: false
                },
                level100: {
                    id: 'level100',
                    title: 'Century Club',
                    description: 'Reach Level 100',
                    icon: '🏆',
                    xpReward: 1000,
                    unlocked: false
                }
            },

            // Streak Achievements
            streaks: {
                streak3: {
                    id: 'streak3',
                    title: 'Getting in the Groove',
                    description: 'Maintain a 3-day streak',
                    icon: '🔥',
                    xpReward: 30,
                    unlocked: false
                },
                streak7: {
                    id: 'streak7',
                    title: 'Week Warrior',
                    description: 'Maintain a 7-day streak',
                    icon: '🔥🔥',
                    xpReward: 75,
                    unlocked: false
                },
                streak30: {
                    id: 'streak30',
                    title: 'Monthly Master',
                    description: 'Maintain a 30-day streak',
                    icon: '🔥🔥🔥',
                    xpReward: 300,
                    unlocked: false
                },
                streak100: {
                    id: 'streak100',
                    title: 'Century Streak',
                    description: 'Maintain a 100-day streak',
                    icon: '🔥🔥🔥🔥',
                    xpReward: 1000,
                    unlocked: false
                }
            },

            // Activity Achievements
            activities: {
                firstWorkout: {
                    id: 'firstWorkout',
                    title: 'First Steps',
                    description: 'Complete your first workout',
                    icon: '💪',
                    xpReward: 25,
                    unlocked: false
                },
                workoutMaster: {
                    id: 'workoutMaster',
                    title: 'Fitness Fanatic',
                    description: 'Complete 50 workouts',
                    icon: '🏋️',
                    xpReward: 200,
                    unlocked: false
                },
                studyStreak: {
                    id: 'studyStreak',
                    title: 'Knowledge Seeker',
                    description: 'Study for 5 days in a row',
                    icon: '📚',
                    xpReward: 100,
                    unlocked: false
                },
                workaholic: {
                    id: 'workaholic',
                    title: 'Productivity Pro',
                    description: 'Log 100 hours of work',
                    icon: '💼',
                    xpReward: 300,
                    unlocked: false
                }
            },

            // Time-based Achievements
            timeBased: {
                earlyBird: {
                    id: 'earlyBird',
                    title: 'Early Bird',
                    description: 'Complete an activity before 8 AM',
                    icon: '🌅',
                    xpReward: 50,
                    unlocked: false
                },
                nightOwl: {
                    id: 'nightOwl',
                    title: 'Night Owl',
                    description: 'Complete an activity after 10 PM',
                    icon: '🦉',
                    xpReward: 50,
                    unlocked: false
                },
                weekendWarrior: {
                    id: 'weekendWarrior',
                    title: 'Weekend Warrior',
                    description: 'Complete activities on 5 consecutive weekends',
                    icon: '🎉',
                    xpReward: 150,
                    unlocked: false
                }
            },

            // Special Achievements
            special: {
                firstDay: {
                    id: 'firstDay',
                    title: 'Day One',
                    description: 'Complete your first day of activities',
                    icon: '🎯',
                    xpReward: 25,
                    unlocked: false
                },
                varietyMaster: {
                    id: 'varietyMaster',
                    title: 'Jack of All Trades',
                    description: 'Complete activities in all 3 categories',
                    icon: '🎭',
                    xpReward: 100,
                    unlocked: false
                },
                speedDemon: {
                    id: 'speedDemon',
                    title: 'Speed Demon',
                    description: 'Complete 3 activities in one day',
                    icon: '⚡',
                    xpReward: 75,
                    unlocked: false
                },
                marathon: {
                    id: 'marathon',
                    title: 'Marathon Runner',
                    description: 'Complete a 2+ hour activity',
                    icon: '🏃',
                    xpReward: 200,
                    unlocked: false
                },
                earlyRiser: {
                    id: 'earlyRiser',
                    title: 'Early Riser',
                    description: 'Complete 5 activities before 7 AM',
                    icon: '🌅',
                    xpReward: 150,
                    unlocked: false
                },
                nightShift: {
                    id: 'nightShift',
                    title: 'Night Shift Worker',
                    description: 'Complete 10 activities after 11 PM',
                    icon: '🌙',
                    xpReward: 200,
                    unlocked: false
                },
                weekendWarrior: {
                    id: 'weekendWarrior',
                    title: 'Weekend Warrior',
                    description: 'Complete activities on 10 consecutive weekends',
                    icon: '🎉',
                    xpReward: 300,
                    unlocked: false
                },
                consistencyKing: {
                    id: 'consistencyKing',
                    title: 'Consistency King',
                    description: 'Complete at least one activity every day for 2 weeks',
                    icon: '👑',
                    xpReward: 400,
                    unlocked: false
                },
                speedDemon: {
                    id: 'speedDemon',
                    title: 'Speed Demon',
                    description: 'Complete 5 activities in a single day',
                    icon: '⚡',
                    xpReward: 250,
                    unlocked: false
                },
                varietyMaster: {
                    id: 'varietyMaster',
                    title: 'Jack of All Trades',
                    description: 'Complete activities in all 3 categories in one day',
                    icon: '🎭',
                    xpReward: 300,
                    unlocked: false
                },
                firstDay: {
                    id: 'firstDay',
                    title: 'Day One',
                    description: 'Complete your first day of activities',
                    icon: '🎯',
                    xpReward: 25,
                    unlocked: false
                },
                productivityGuru: {
                    id: 'productivityGuru',
                    title: 'Productivity Guru',
                    description: 'Log 200 hours of work activities',
                    icon: '💼',
                    xpReward: 500,
                    unlocked: false
                },
                fitnessEnthusiast: {
                    id: 'fitnessEnthusiast',
                    title: 'Fitness Enthusiast',
                    description: 'Complete 100 workout activities',
                    icon: '💪',
                    xpReward: 400,
                    unlocked: false
                },
                knowledgeSeeker: {
                    id: 'knowledgeSeeker',
                    title: 'Knowledge Seeker',
                    description: 'Study for 500 hours total',
                    icon: '📚',
                    xpReward: 600,
                    unlocked: false
                },
                timeMaster: {
                    id: 'timeMaster',
                    title: 'Time Master',
                    description: 'Log 1000 total hours across all activities',
                    icon: '⏰',
                    xpReward: 800,
                    unlocked: false
                },
                balanceSeeker: {
                    id: 'balanceSeeker',
                    title: 'Balance Seeker',
                    description: 'Have equal time spent in all 3 categories (within 10%)',
                    icon: '⚖️',
                    xpReward: 350,
                    unlocked: false
                },
                momentumBuilder: {
                    id: 'momentumBuilder',
                    title: 'Momentum Builder',
                    description: 'Increase your daily activity count for 7 consecutive days',
                    icon: '📈',
                    xpReward: 300,
                    unlocked: false
                },
                weekendConsistency: {
                    id: 'weekendConsistency',
                    title: 'Weekend Consistency',
                    description: 'Complete activities on 20 different weekends',
                    icon: '🗓️',
                    xpReward: 400,
                    unlocked: false
                },
                earlyBird: {
                    id: 'earlyBird',
                    title: 'Early Bird',
                    description: 'Complete an activity before 8 AM',
                    icon: '🌅',
                    xpReward: 50,
                    unlocked: false
                },
                nightOwl: {
                    id: 'nightOwl',
                    title: 'Night Owl',
                    description: 'Complete an activity after 10 PM',
                    icon: '🦉',
                    xpReward: 50,
                    unlocked: false
                }
            }
        };
    }

    // Check and award achievements based on user stats
    checkAchievements(userStats, activities) {
        const newAchievements = [];
        
        // Check milestone achievements
        Object.values(this.achievements.milestones).forEach(achievement => {
            if (!achievement.unlocked && userStats.level >= this.getLevelRequirement(achievement.id)) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        });

        // Check streak achievements
        Object.values(this.achievements.streaks).forEach(achievement => {
            if (!achievement.unlocked && userStats.streakCount >= this.getStreakRequirement(achievement.id)) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        });

        // Check activity achievements
        const activityStats = this.calculateActivityStats(activities);
        Object.values(this.achievements.activities).forEach(achievement => {
            if (!achievement.unlocked && this.checkActivityAchievement(achievement, activityStats)) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        });

        // Check time-based achievements
        Object.values(this.achievements.timeBased).forEach(achievement => {
            if (!achievement.unlocked && this.checkTimeBasedAchievement(achievement, activities)) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        });

        // Check special achievements
        Object.values(this.achievements.special).forEach(achievement => {
            if (!achievement.unlocked && this.checkSpecialAchievement(achievement, activities, userStats)) {
                achievement.unlocked = true;
                newAchievements.push(achievement);
            }
        });

        return newAchievements;
    }

    getLevelRequirement(achievementId) {
        const levelMap = {
            'level5': 5,
            'level10': 10,
            'level25': 25,
            'level50': 50,
            'level100': 100
        };
        return levelMap[achievementId] || 0;
    }

    getStreakRequirement(achievementId) {
        const streakMap = {
            'streak3': 3,
            'streak7': 7,
            'streak30': 30,
            'streak100': 100
        };
        return streakMap[achievementId] || 0;
    }

    calculateActivityStats(activities) {
        const stats = {
            workoutCount: 0,
            studyCount: 0,
            workCount: 0,
            totalWorkoutTime: 0,
            totalStudyTime: 0,
            totalWorkTime: 0,
            categories: new Set(),
            dailyActivities: {},
            weekendActivities: 0,
            earlyActivities: 0,
            lateActivities: 0,
            veryEarlyActivities: 0,
            veryLateActivities: 0,
            weekendDays: new Set(),
            consecutiveDays: 0,
            dailyActivityCounts: {},
            categoryTimeDistribution: { WORKOUT: 0, STUDY: 0, WORK: 0 }
        };

        activities.forEach(activity => {
            const date = new Date(activity.date || activity.createdAt);
            const dayOfWeek = date.getDay();
            const hour = date.getHours();
            const dateKey = date.toDateString();

            // Count by category
            if (activity.type === 'WORKOUT') {
                stats.workoutCount++;
                stats.totalWorkoutTime += activity.duration || 0;
                stats.categoryTimeDistribution.WORKOUT += activity.duration || 0;
            } else if (activity.type === 'STUDY') {
                stats.studyCount++;
                stats.totalStudyTime += activity.duration || 0;
                stats.categoryTimeDistribution.STUDY += activity.duration || 0;
            } else if (activity.type === 'WORK') {
                stats.workCount++;
                stats.totalWorkTime += activity.duration || 0;
                stats.categoryTimeDistribution.WORK += activity.duration || 0;
            }

            stats.categories.add(activity.type);

            // Track daily activities
            if (!stats.dailyActivities[dateKey]) {
                stats.dailyActivities[dateKey] = 0;
            }
            stats.dailyActivities[dateKey]++;

            // Track weekend activities
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                stats.weekendActivities++;
                stats.weekendDays.add(dateKey);
            }

            // Track early/late activities
            if (hour < 8) {
                stats.earlyActivities++;
            } else if (hour >= 22) {
                stats.lateActivities++;
            }

            // Track very early/very late activities
            if (hour < 7) {
                stats.veryEarlyActivities++;
            } else if (hour >= 23) {
                stats.veryLateActivities++;
            }

            // Track daily activity counts for momentum
            if (!stats.dailyActivityCounts[dateKey]) {
                stats.dailyActivityCounts[dateKey] = 0;
            }
            stats.dailyActivityCounts[dateKey]++;
        });

        return stats;
    }

    checkActivityAchievement(achievement, activityStats) {
        switch (achievement.id) {
            case 'firstWorkout':
                return activityStats.workoutCount >= 1;
            case 'workoutMaster':
                return activityStats.workoutCount >= 50;
            case 'studyStreak':
                // This would need more complex logic for consecutive days
                return activityStats.studyCount >= 5;
            case 'workaholic':
                return activityStats.totalWorkTime >= 6000; // 100 hours in minutes
            default:
                return false;
        }
    }

    checkTimeBasedAchievement(achievement, activities) {
        const activityStats = this.calculateActivityStats(activities);
        
        switch (achievement.id) {
            case 'earlyBird':
                return activityStats.earlyActivities >= 1;
            case 'nightOwl':
                return activityStats.lateActivities >= 1;
            case 'earlyRiser':
                return activityStats.veryEarlyActivities >= 5;
            case 'nightShift':
                return activityStats.veryLateActivities >= 10;
            case 'weekendWarrior':
                return activityStats.weekendDays.size >= 10;
            case 'weekendConsistency':
                return activityStats.weekendDays.size >= 20;
            default:
                return false;
        }
    }

    checkSpecialAchievement(achievement, activities, userStats) {
        const activityStats = this.calculateActivityStats(activities);
        
        switch (achievement.id) {
            case 'firstDay':
                return activities.length >= 1;
            case 'varietyMaster':
                return activityStats.categories.size >= 3;
            case 'speedDemon':
                return Object.values(activityStats.dailyActivityCounts).some(count => count >= 5);
            case 'marathon':
                return activities.some(activity => (activity.duration || 0) >= 120); // 2+ hours
            case 'consistencyKing':
                return this.checkConsecutiveDays(activities, 14);
            case 'momentumBuilder':
                return this.checkMomentum(activities);
            case 'balanceSeeker':
                return this.checkBalance(activityStats);
            case 'productivityGuru':
                return activityStats.totalWorkTime >= 12000; // 200 hours in minutes
            case 'fitnessEnthusiast':
                return activityStats.workoutCount >= 100;
            case 'knowledgeSeeker':
                return activityStats.totalStudyTime >= 30000; // 500 hours in minutes
            case 'timeMaster':
                return (activityStats.totalWorkoutTime + activityStats.totalStudyTime + activityStats.totalWorkTime) >= 60000; // 1000 hours in minutes
            default:
                return false;
        }
    }

    // Get all achievements for display
    getAllAchievements() {
        const allAchievements = [];
        
        Object.values(this.achievements).forEach(category => {
            Object.values(category).forEach(achievement => {
                allAchievements.push({
                    ...achievement,
                    category: this.getCategoryName(achievement.id)
                });
            });
        });

        return allAchievements.sort((a, b) => {
            // Sort by unlocked status, then by category
            if (a.unlocked !== b.unlocked) {
                return a.unlocked ? 1 : -1;
            }
            return a.category.localeCompare(b.category);
        });
    }

    getCategoryName(achievementId) {
        if (achievementId.startsWith('level')) return 'Milestones';
        if (achievementId.startsWith('streak')) return 'Streaks';
        if (['firstWorkout', 'workoutMaster', 'studyStreak', 'workaholic', 'productivityGuru', 'fitnessEnthusiast', 'knowledgeSeeker'].includes(achievementId)) return 'Activities';
        if (['earlyBird', 'nightOwl', 'earlyRiser', 'nightShift', 'weekendWarrior', 'weekendConsistency'].includes(achievementId)) return 'Time-based';
        return 'Special';
    }

    // Get progress for locked achievements
    getAchievementProgress(achievementId, userStats, activities) {
        const activityStats = this.calculateActivityStats(activities);
        
        switch (achievementId) {
            case 'level5':
            case 'level10':
            case 'level25':
            case 'level50':
            case 'level100':
                const requiredLevel = this.getLevelRequirement(achievementId);
                return Math.min(100, (userStats.level / requiredLevel) * 100);
            
            case 'streak3':
            case 'streak7':
            case 'streak30':
            case 'streak100':
                const requiredStreak = this.getStreakRequirement(achievementId);
                return Math.min(100, (userStats.streakCount / requiredStreak) * 100);
            
            case 'workoutMaster':
                return Math.min(100, (activityStats.workoutCount / 50) * 100);
            
            case 'workaholic':
                return Math.min(100, (activityStats.totalWorkTime / 6000) * 100);
            
            case 'earlyRiser':
                return Math.min(100, (activityStats.veryEarlyActivities / 5) * 100);
            
            case 'nightShift':
                return Math.min(100, (activityStats.veryLateActivities / 10) * 100);
            
            case 'weekendWarrior':
                return Math.min(100, (activityStats.weekendDays.size / 10) * 100);
            
            case 'weekendConsistency':
                return Math.min(100, (activityStats.weekendDays.size / 20) * 100);
            
            case 'productivityGuru':
                return Math.min(100, (activityStats.totalWorkTime / 12000) * 100);
            
            case 'fitnessEnthusiast':
                return Math.min(100, (activityStats.workoutCount / 100) * 100);
            
            case 'knowledgeSeeker':
                return Math.min(100, (activityStats.totalStudyTime / 30000) * 100);
            
            case 'timeMaster':
                const totalTime = activityStats.totalWorkoutTime + activityStats.totalStudyTime + activityStats.totalWorkTime;
                return Math.min(100, (totalTime / 60000) * 100);
            
            default:
                return 0;
        }
    }

    // Helper method to check consecutive days
    checkConsecutiveDays(activities, requiredDays) {
        if (activities.length === 0) return false;
        
        const dates = [...new Set(activities.map(a => 
            new Date(a.date || a.createdAt).toDateString()
        ))].sort();
        
        let maxConsecutive = 0;
        let currentConsecutive = 1;
        
        for (let i = 1; i < dates.length; i++) {
            const prevDate = new Date(dates[i - 1]);
            const currDate = new Date(dates[i]);
            const diffTime = currDate - prevDate;
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                currentConsecutive++;
            } else {
                maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
                currentConsecutive = 1;
            }
        }
        
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
        return maxConsecutive >= requiredDays;
    }

    // Helper method to check momentum (increasing daily activity count)
    checkMomentum(activities) {
        const dailyCounts = {};
        activities.forEach(activity => {
            const dateKey = new Date(activity.date || activity.createdAt).toDateString();
            dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
        });
        
        const sortedDates = Object.keys(dailyCounts).sort();
        if (sortedDates.length < 7) return false;
        
        let consecutiveIncreasing = 0;
        for (let i = 1; i < sortedDates.length; i++) {
            if (dailyCounts[sortedDates[i]] > dailyCounts[sortedDates[i - 1]]) {
                consecutiveIncreasing++;
                if (consecutiveIncreasing >= 6) return true; // 7 consecutive days
            } else {
                consecutiveIncreasing = 0;
            }
        }
        
        return false;
    }

    // Helper method to check balance between categories
    checkBalance(activityStats) {
        const { WORKOUT, STUDY, WORK } = activityStats.categoryTimeDistribution;
        const total = WORKOUT + STUDY + WORK;
        
        if (total === 0) return false;
        
        const workoutPercent = (WORKOUT / total) * 100;
        const studyPercent = (STUDY / total) * 100;
        const workPercent = (WORK / total) * 100;
        
        // Check if all categories are within 10% of each other
        const avg = (workoutPercent + studyPercent + workPercent) / 3;
        const tolerance = 10;
        
        return Math.abs(workoutPercent - avg) <= tolerance &&
               Math.abs(studyPercent - avg) <= tolerance &&
               Math.abs(workPercent - avg) <= tolerance;
    }
}

export { AchievementManager }; 