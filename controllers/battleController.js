const Dungeon = require('../models/Dungeon');
const Monster = require('../models/Monster');
const User = require('../models/User');
const { applyLevelUps } = require('../controllers/levelingController');


exports.startDungeonRun = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const maxFloor = await Dungeon.countDocuments(); // Total number of floors available
    let currentFloor = 1;
    let totalXP = 0;
    let totalGold = 0;
    let userHP = user.hp;

    while (currentFloor <= maxFloor && userHP > 0) {
      const dungeon = await Dungeon.findOne({ floor: currentFloor }).populate('monsters');

      if (!dungeon) {
        return res.status(404).json({ message: `Dungeon floor ${currentFloor} not found` });
      }

      let floorXP = 0;
      let floorGold = 0;

      for (const monster of dungeon.monsters) {
        let monsterHP = monster.hp;

        while (userHP > 0 && monsterHP > 0) {
          // User attacks
          const damageToMonster = Math.max(0, user.atk - monster.def);
          monsterHP -= damageToMonster;

          // Monster attacks if still alive
          if (monsterHP > 0) {
            const damageToUser = Math.max(0, monster.atk - user.def);
            userHP -= damageToUser;
          }
        }

        if (userHP <= 0) break; // User lost to this monster

        floorXP += monster.xpReward;
        floorGold += monster.goldReward;
      }

      if (userHP <= 0) break; // User lost on this floor

      totalXP += floorXP;
      totalGold += floorGold;
      currentFloor++;
    }

    // Post-run updates
    user.hp = userHP > 0 ? userHP : Math.max(Math.floor(user.maxHp * 0.25), 1); // Reduce to 25% if lost
    user.xp += totalXP;
    user.gold += totalGold;
    const levelUp = applyLevelUps(user);

    await user.save();

    res.status(200).json({
      message: 'Dungeon run complete',
      xp: totalXP,
      gold: totalGold,
      remainingHP: user.hp,
      highestFloorReached: currentFloor - (userHP > 0 ? 0 : 1),
      levelUp
    });
  } catch (err) {
    console.error('Dungeon run error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
