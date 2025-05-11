const mongoose = require('mongoose');

const MonsterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  atk: { type: Number, required: true },
  def: { type: Number, required: true },
  hp: { type: Number, required: true },
  xpReward: { type: Number, required: true },
  goldReward: { type: Number, required: true }
});

module.exports = mongoose.model('Monster', MonsterSchema);
