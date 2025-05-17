const User = require('../models/User');
const mongoose = require("mongoose");
const { applyLevelUps } = require('../controllers/levelingController');

// Add Task
exports.addTask = async (req, res) => {
  const { title, difficulty, type, deadline } = req.body;

  // Validate task difficulty and type
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ message: 'Invalid difficulty level' });
  }
  if (!['task', 'daily'].includes(type)) {
    return res.status(400).json({ message: 'Invalid task type' });
  }

  try {
    const user = await User.findById(req.user.id);

    const task = {
      title,
      difficulty,
      type,
      completed: false,
      deadline: deadline ? new Date(deadline) : undefined, // If there's a deadline, use it
    };

    user.tasks.push(task);
    await user.save();

    res.status(201).json({ message: 'Task added successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Task
exports.getTasks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tasks = user.tasks.filter(task => task.type === 'task');
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getDailies = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const dailies = user.tasks.filter(task => task.type === 'daily');
    res.status(200).json(dailies);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


// Edit Task
exports.editTask = async (req, res) => {
  const { taskId } = req.params;
  const { title, difficulty, type, deadline } = req.body;

  // Validate task difficulty and type
  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ message: 'Invalid difficulty level' });
  }
  if (!['task', 'daily'].includes(type)) {
    return res.status(400).json({ message: 'Invalid task type' });
  }

  try {
    const user = await User.findById(req.user.id);
    const task = user.tasks.id(taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.title = title || task.title;
    task.difficulty = difficulty || task.difficulty;
    task.type = type || task.type;
    task.deadline = deadline ? new Date(deadline) : task.deadline;

    await user.save();

    res.json({ message: 'Task updated successfully', task });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.toggleTaskCompletion = async (req, res) => {
  const { taskId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    const task = user.tasks.id(taskId);

    if (!task) return res.status(404).json({ message: 'Task not found' });

    let leveledUp = false; // <-- Declare here

    // Only reward if marking as completed
    if (!task.completed) {
      let goldEarned = 0;
      let expEarned = 0;
      switch (task.difficulty) {
        case 'easy':
          goldEarned = 8;
          expEarned = 10;
          break;
        case 'medium':
          goldEarned = 12;
          expEarned = 25;
          break;
        case 'hard':
          goldEarned = 15;
          expEarned = 40;
          break;
      }
      user.gold += goldEarned;
      user.xp += expEarned;
      leveledUp = applyLevelUps(user); // <-- Assign result to existing variable
    }

    task.completed = !task.completed;
    await user.save();

    res.json({
      message: `Task marked as ${task.completed ? 'completed' : 'incomplete'}`,
      completed: task.completed,
      currentGold: user.gold,
      leveledUp
    });
  } catch (err) {
    console.error("Toggle Task Error:", err); // <== Add this for easier debugging
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove Task
exports.removeTask = async (req, res) => {
    const { taskId } = req.params;
  
    // Validate taskId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }
  
    try {
      const user = await User.findById(req.user.id);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Use the pull method to remove the task by its ID
      const taskIndex = user.tasks.findIndex(task => task._id.toString() === taskId);
      
      if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
      }
  
      // Remove the task from the array
      user.tasks.splice(taskIndex, 1);
  
      await user.save(); // Save the updated user document
  
      res.json({ message: 'Task removed successfully' });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).json({ message: 'Server error' });
    }
  };