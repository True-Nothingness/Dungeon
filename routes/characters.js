const express = require('express');
const router = express.Router();
const constants = require('../data/constants');

router.get('/', (req, res) => {
  res.json({
    characters: constants.allowedCharacters,
    pets: constants.allowedPets,
    stats: constants.characterStats,
  });
});

module.exports = router;
