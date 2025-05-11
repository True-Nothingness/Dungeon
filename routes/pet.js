const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const petController = require('../controllers/petController');

router.post('/pick', authenticateToken, petController.pickPet);

module.exports = router;
