const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { allowedCharacters, characterStats } = require('../data/constants');
const { allowedPets } = require('../data/constants');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters, include a number and an uppercase letter" });
    }    

    try {
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
        if (existingUser.username === username) {
          return res.status(400).json({ message: 'Username already exists' });
        } else {
          return res.status(400).json({ message: 'Email already exists' });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, email, password: hashedPassword });
      await user.save();
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  };
  

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastLogin = new Date(user.lastLogin || 0);

    let petLeft = false;
    let hpLost = 0;
    let resetOccurred = false;

    // Run daily punishment, pet abandonment, and daily reset only once per day
    if (lastLogin < todayStart) {
      const uncompletedDailies = user.tasks.filter(task => task.type === "daily" && !task.completed);
      const overdueTasks = user.tasks.filter(
      task => task.type === "task" && !task.completed && task.deadline && new Date(task.deadline) < now);

      const missedCount = uncompletedDailies.length + overdueTasks.length;

      if (missedCount > 0) {
        hpLost = 10 * missedCount;
        user.hp -= hpLost;
        if (user.hp <= 0) {
          user.hp = 0;
          user.level = Math.max(1, user.level - 1);
        }
      }

      // Pet abandonment check
      if (user.selectedPet && user.selectedPet.acquiredAt) {
        const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
        if (diffDays >= 7) {
          user.selectedPet = null;
          petLeft = true;
        }
      }

      // Reset dailies
      resetOccurred = resetDailies(user);
    }

    user.lastLogin = now;
    await user.save();

    res.json({
      user,
      petLeft,
      hpLost,
      resetOccurred
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.pickCharacter = async (req, res) => {
  const { character } = req.body;

  // Check if the character is valid
  if (!allowedCharacters.includes(character)) {
    return res.status(400).json({ message: 'Invalid character choice' });
  }

  try {
    const user = await User.findById(req.user.id);

    // Prevent changing the character if one is already selected
    if (user.selectedCharacter) {
      return res.status(400).json({ message: 'Character already selected' });
    }

    // Assign character stats to the user
    user.selectedCharacter = character;
    user.atk = characterStats[character].atk;
    user.def = characterStats[character].def;
    user.hp = characterStats[character].hp;
    user.maxHp = characterStats[character].hp;

    await user.save();

    res.json({ message: 'Character selected successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.pickPet = async (req, res) => {
  const { name, species } = req.body;

  // Check if the name and species are provided
  if (!name || !species) {
    return res.status(400).json({ message: "Name and species are required" });
  }

  // Check if the species is allowed
  const isPetAllowed = allowedPets.includes(species);

  if (!isPetAllowed) {
    return res.status(400).json({ message: "This pet species is not allowed" });
  }

  try {
    const user = await User.findById(req.user.id);

    // Check if the user already has a pet
    if (user.selectedPet && user.selectedPet.name) {
      return res.status(400).json({ message: "You already have a pet" });
    }

    // Assign the pet to the user
    user.selectedPet = {
      name,
      species,
      acquiredAt: new Date()
    };

    await user.save();
    res.status(200).json({ message: "Pet picked successfully", pet: user.selectedPet });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const resetDailies = (user) => {
  if (!Array.isArray(user.tasks)) return false;

  let resetAny = false;
  user.tasks.forEach(task => {
    if (task.type === 'daily' && task.completed) {
      task.completed = false;
      resetAny = true;
    }
  });

  return resetAny;
};



