const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const adminAuth = require("../middleware/adminAuth");

// --- Login ---
router.post("/login", adminController.login);

// --- User management ---
router.get("/users", adminAuth, adminController.getUsers);
router.delete("/users/:id", adminAuth, adminController.deleteUser);

// --- Monster management ---
router.get("/monsters", adminAuth, adminController.getMonsters);
router.post("/monsters", adminAuth, adminController.createMonster);
router.put("/monsters/:id", adminAuth, adminController.updateMonster);
router.delete("/monsters/:id", adminAuth, adminController.deleteMonster);

// --- Dungeon management ---
router.get("/dungeons", adminAuth, adminController.getDungeons);
router.post("/dungeons", adminAuth, adminController.createDungeon);
router.put("/dungeons/:id", adminAuth, adminController.updateDungeon);
router.delete("/dungeons/:id", adminAuth, adminController.deleteDungeon);

module.exports = router;
