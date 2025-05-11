const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authenticateToken = require('../middleware/auth');

router.post('/buy', authenticateToken, itemController.buyItem);
router.post('/use', authenticateToken, itemController.useItem);

module.exports = router;
