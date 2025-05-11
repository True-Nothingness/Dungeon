const User = require('../models/User');

exports.pickPet = async (req, res) => {
  const { name, species } = req.body;

  if (!name || !species) {
    return res.status(400).json({ message: "Name and species are required" });
  }

  try {
    const user = await User.findById(req.user.id);

    if (user.selectedPet && user.selectedPet.name) {
      return res.status(400).json({ message: "You already have a pet" });
    }

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
