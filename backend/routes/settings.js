const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { updateName, updatePassword } = require('../controllers/settingsController');
const { protect }  = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);
router.patch('/name',
  body('name').trim().notEmpty().withMessage('Name cannot be empty'),
  validate, updateName
);
router.patch('/password',
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate, updatePassword
);
module.exports = router;