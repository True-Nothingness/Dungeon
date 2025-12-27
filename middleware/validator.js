const { body, param, validationResult } = require('express-validator');

const handleErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Invalid input',
      details: errors.array()
    });
  }
  next();
};

exports.validateRegister = [
  body('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('Password too short'),

  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('Username too short'),

  handleErrors
];

exports.validateLogin = [
  body('email').isEmail(),
  body('password').isString().notEmpty(),
  handleErrors
];

exports.validateResetPassword = [
  body('token').isString().notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  handleErrors
];
