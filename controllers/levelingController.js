function getXPRequiredForLevel(level) {
    return 100 + (level - 1) * 50;
  }
  
  function applyLevelUps(user) {
    let xpRequired = getXPRequiredForLevel(user.level);
  
    while (user.xp >= xpRequired) {
      user.xp -= xpRequired;
      user.level += 1;
  
      user.atk += 10;
      user.def += 10;
      user.maxHp += 10; // Make sure user has a maxHp field
      user.hp = user.maxHp; // Full heal
  
      xpRequired = getXPRequiredForLevel(user.level);
    }
  }
  
  module.exports = { applyLevelUps };
  