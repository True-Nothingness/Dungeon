const Monster = require("../models/Monster");
const Dungeon = require("../models/Dungeon");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const ADMIN_USERNAME = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "supersecret";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// --- LOGIN ---
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
};

// --- USERS ---
// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email gold level");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// MONSTER MANAGEMENT
// =============================

// GET all monsters
exports.getMonsters = async (req, res) => {
  try {
    const monsters = await Monster.find();
    res.json(monsters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE monster
exports.createMonster = async (req, res) => {
  try {
    const monster = new Monster(req.body);
    await monster.save();
    res.status(201).json(monster);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// UPDATE monster
exports.updateMonster = async (req, res) => {
  try {
    const monster = await Monster.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!monster) return res.status(404).json({ message: "Monster not found" });
    res.json(monster);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE monster
exports.deleteMonster = async (req, res) => {
  try {
    const monster = await Monster.findByIdAndDelete(req.params.id);
    if (!monster) return res.status(404).json({ message: "Monster not found" });
    res.json({ message: "Monster deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// =============================
// DUNGEON MANAGEMENT
// =============================

// GET all dungeons
exports.getDungeons = async (req, res) => {
  try {
    const dungeons = await Dungeon.find().populate("monsters");
    res.json(dungeons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE dungeon
exports.createDungeon = async (req, res) => {
  try {
    const { floor, monsters } = req.body;
    if (!floor || !monsters || !Array.isArray(monsters)) {
      return res.status(400).json({ error: "Floor and monsters array required" });
    }

    const dungeon = new Dungeon({ floor, monsters });
    await dungeon.save();

    res.json(dungeon);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// UPDATE dungeon
exports.updateDungeon = async (req, res) => {
  try {
    const dungeon = await Dungeon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dungeon) return res.status(404).json({ message: "Dungeon not found" });
    res.json(dungeon);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE dungeon
exports.deleteDungeon = async (req, res) => {
  try {
    const dungeon = await Dungeon.findByIdAndDelete(req.params.id);
    if (!dungeon) return res.status(404).json({ message: "Dungeon not found" });
    res.json({ message: "Dungeon deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
