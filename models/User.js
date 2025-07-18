const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
  },
  type: {
    type: String,
    enum: ["task", "daily"],
  },
  completed: Boolean,
  deadline: Date, 
});


const petSchema = new mongoose.Schema({
  name: String,
  species: String,
  acquiredAt: Date,
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: { type: Number, default: 1 },
  atk: { type: Number, default: 10 },
  def: { type: Number, default: 10 },
  hp: { type: Number, default: 100 },
  maxHp: { type: Number, default: 100 },
  xp: { type: Number, default: 0 },
  gold: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now },
  tasks: { type: [taskSchema], default: [] },
  selectedCharacter: String,
  selectedPet: {
  name: String,
  species: String,
  acquiredAt: { type: Date, default: Date.now }
},
  inventory: [
  {
    itemName: String,
    quantity: Number,
  }
],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
});

module.exports = mongoose.model("User", userSchema);
