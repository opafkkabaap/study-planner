const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { getExams, createExam, updateExam, deleteExam } = require('../controllers/examController');
const { protect }  = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);
router.get('/', getExams);
router.post('/',
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('date').matches(/^\d{2}\/\d{2}\/\d{4}$/).withMessage('Date must be DD/MM/YYYY'),
  validate,
  createExam
);
router.put('/:id', updateExam);
router.delete('/:id', deleteExam);
module.exports = router;