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
        return res.status(400).json({ message: 'Username or email already exists' });
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

    // Check for daily punishment
    applyDailyPunishment(user);
    const result = checkPetAbandonment(user);
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      petLeft: result.petLeft
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
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
    const user = await User.findById(req.user.id); // Get the user from the database

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

const applyDailyPunishment = (user) => {
  const today = new Date().toDateString();
  const lastLogin = new Date(user.lastLogin).toDateString();

  if (today !== lastLogin) {
    const uncompletedDailies = user.tasks.filter(
      task => task.type === "daily" && !task.completed
    );

    if (uncompletedDailies.length > 0) {
      const hpLoss = 10 * uncompletedDailies.length; // 10 HP per missed daily
      user.hp -= hpLoss;
      if (user.hp < 0) {
        user.hp = 0;
        user.level = Math.max(1, user.level - 1); // Prevent level from dropping below 1
      }      
    }
  }
};

const checkPetAbandonment = (user) => {
  if (!user.selectedPet || !user.selectedPet.acquiredAt) return { petLeft: false };

  const lastLogin = new Date(user.lastLogin);
  const now = new Date();
  const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

  if (diffDays >= 7) {
    user.selectedPet = null;
    return { petLeft: true }; 
  }

  return { petLeft: false };
};



