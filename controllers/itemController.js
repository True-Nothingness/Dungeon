const User = require('../models/User');
const { availableItems } = require('../data/items');

// Buy an item
exports.buyItem = async (req, res) => {
  const { itemName, quantity } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the item by name
    const item = availableItems.find(i => i.name === itemName);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const totalPrice = item.price * quantity;
    if (user.gold < totalPrice) {
      return res.status(400).json({ message: 'Not enough gold' });
    }

    // Deduct gold and add item to inventory
    user.gold -= totalPrice;

    // Check if the item already exists in the inventory
    const existingItem = user.inventory.find(i => i.itemName === itemName);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      user.inventory.push({
        itemType: item.type,
        itemName: item.name,
        quantity
      });
    }

    await user.save();
    res.status(200).json({ message: 'Item purchased successfully', inventory: user.inventory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Use an item
exports.useItem = async (req, res) => {
  const { itemName } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find the item in the user's inventory
    const item = user.inventory.find(i => i.itemName === itemName);
    if (!item) return res.status(404).json({ message: 'Item not found in inventory' });

    if (item.quantity <= 0) return res.status(400).json({ message: 'No more items of this type' });

    // Find the corresponding item in availableItems (this is where itemType and effect come from)
    const itemDetails = availableItems.find(i => i.name === itemName);
    if (!itemDetails) return res.status(404).json({ message: 'Item details not found' });

    // Apply healing effect (for potions)
    if (itemDetails.type === 'potion' && itemDetails.effect === 'heal') {
      const healingAmount = itemDetails.amount;
      user.hp = Math.min(user.hp + healingAmount, user.maxHp); // Max HP check
    }

    // Apply stat effects (for stat potions)
    if (itemDetails.type === 'statPotion') {
      if (itemDetails.effect === 'atk') {
        user.atk += itemDetails.amount;
      } else if (itemDetails.effect === 'def') {
        user.def += itemDetails.amount;
      }
    }

    // Decrease the quantity of the item in the user's inventory after use
    item.quantity -= 1;

    // Save the updated user data
    await user.save();
    res.status(200).json({ message: 'Item used successfully', user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

