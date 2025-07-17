export class XPManager {
  constructor() {
    this.xp = 0; // XP within the current level
    this.level = 1;
  }

  addXP(activity) {
    const rates = {
      workout: 1,
      study: 2,
      money: 0.5
    };
    let xpToAdd = activity.amount * (rates[activity.type.toLowerCase()] || 1);
    while (xpToAdd > 0) {
      const xpNeeded = this.level * 100 - this.xp;
      if (xpToAdd >= xpNeeded) {
        this.level += 1;
        xpToAdd -= xpNeeded;
        this.xp = 0;
      } else {
        this.xp += xpToAdd;
        xpToAdd = 0;
      }
    }
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
