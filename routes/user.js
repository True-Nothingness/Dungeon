const express = require('express');
const authenticateToken = require('../middleware/auth');
const loginLimiter = require('../middleware/rateLimiter');
const userController = require('../controllers/userController');
const {
  validateRegister,
  validateLogin,
  validateResetPassword
} = require('../middleware/validator');

const router = express.Router();

router.post('/register', loginLimiter, validateRegister, userController.register);
router.post('/login', loginLimiter, validateLogin, userController.login);
router.post('/reset-password', validateResetPassword, userController.resetPassword);

router.get('/profile', authenticateToken, userController.getProfile);
router.put('/update', authenticateToken, userController.updateUser);
router.post('/pick-character', authenticateToken, userController.pickCharacter);


module.exports = router;
