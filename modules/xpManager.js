export class XPManager {
  constructor() {
    this.xp = 0;
    this.level = 1;
  }

  addXP(activity) {
    const rates = {
      workout: 1,
      study: 2,
      money: 0.5
    };
    this.xp += (activity.amount * (rates[activity.type.toLowerCase()] || 1));
    this.level = Math.floor(this.xp / 100) + 1;
  }

  recalculateFromActivities(activities) {
    this.xp = 0;
    this.level = 1;
    activities.forEach(activity => this.addXP(activity));
  }

  getStats() {
    return {
      xp: Math.floor(this.xp),
      level: this.level,
      xpForNextLevel: (this.level * 100)
    };
  }
}
