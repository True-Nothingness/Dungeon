const express = require('express');
const authenticateToken = require('../middleware/auth');
const loginLimiter = require('../middleware/rateLimiter');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', loginLimiter, userController.register);
router.post('/login', loginLimiter, userController.login);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/update', authenticateToken, userController.updateUser);
router.post('/pick-character', authenticateToken, userController.pickCharacter);
router.post('/forgot-password', loginLimiter, userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


module.exports = router;
