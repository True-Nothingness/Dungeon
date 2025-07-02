const express = require('express');
const authenticateToken = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/update', authenticateToken, userController.updateUser);
router.post('/pick-character', authenticateToken, userController.pickCharacter);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);


module.exports = router;
