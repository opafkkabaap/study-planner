const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { getProgress, logProgress, getTodayTotal } = require('../controllers/progressController');
const { protect }  = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);
router.get('/today', getTodayTotal);
router.get('/', getProgress);
router.post('/',
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('hours').isFloat({ min: 0, max: 24 }),
  body('day').isInt({ min: 1, max: 31 }),
  body('month').isInt({ min: 0, max: 11 }),
  body('year').isInt({ min: 2020 }),
  validate, logProgress
);
module.exports = router;