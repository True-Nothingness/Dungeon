function getXPRequiredForLevel(level) {
    return 100 + (level - 1) * 50;
  }
  
  function applyLevelUps(user) {
    let xpRequired = getXPRequiredForLevel(user.level);
    let leveledUp = false;
  
    while (user.xp >= xpRequired) {
      user.xp -= xpRequired;
      user.level += 1;
  
      user.atk += 2;
      user.def += 1;
      user.maxHp += 15;
      user.hp = user.maxHp; // Full heal
  
      xpRequired = getXPRequiredForLevel(user.level);
      leveledUp = true;
    }
    return leveledUp;
  }
  
  module.exports = { applyLevelUps };
  