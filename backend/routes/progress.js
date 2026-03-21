// routes/progress.js
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const {
  getProgress, logProgress, getTodayTotal,
} = require('../controllers/progressController');
const { protect }  = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);

// GET /api/progress/today  — must be before /:id style routes
router.get('/today', getTodayTotal);

// GET  /api/progress   ?view=week&month=1&year=2026
// POST /api/progress   { subject, hours, day, month, year }
router
  .route('/')
  .get(getProgress)
  .post(
    [
      body('subject').trim().notEmpty().withMessage('Subject is required'),
      body('hours').isFloat({ min: 0, max: 24 }).withMessage('Hours must be 0–24'),
      body('day').isInt({ min: 1, max: 31 }).withMessage('day must be 1–31'),
      body('month').isInt({ min: 0, max: 11 }).withMessage('month must be 0–11'),
      body('year').isInt({ min: 2020 }).withMessage('year must be ≥ 2020'),
    ],
    validate,
    logProgress
  );

module.exports = router;
