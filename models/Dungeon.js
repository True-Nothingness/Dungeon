const mongoose = require('mongoose');

const DungeonSchema = new mongoose.Schema({
  floor: { type: Number, required: true, unique: true },
  monsters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Monster', required: true }]
});

module.exports = mongoose.model('Dungeon', DungeonSchema);
