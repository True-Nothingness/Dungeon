const express = require('express');
const router = express.Router();
const battleController = require('../controllers/battleController');
const authenticateToken = require('../middleware/auth');

router.post('/run', authenticateToken, battleController.startDungeonRun);

module.exports = router;