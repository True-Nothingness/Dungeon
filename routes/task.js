const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/auth');

router.post('/add', authenticateToken, taskController.addTask);
router.get('/fetch', authenticateToken, taskController.getTasks);
router.put('/edit/:taskId', authenticateToken, taskController.editTask);
router.delete('/remove/:taskId', authenticateToken, taskController.removeTask);
router.patch('/toggle/:taskId', authenticateToken, taskController.toggleTaskCompletion);

module.exports = router;
