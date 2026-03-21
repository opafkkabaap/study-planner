const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');
const { protect }  = require('../middleware/auth');
const { validate } = require('../middleware/validate');

router.use(protect);
router.get('/', getTasks);
router.post('/',
  body('text').trim().notEmpty().withMessage('Task text is required'),
  body('day').isInt({ min: 1, max: 31 }),
  body('month').isInt({ min: 0, max: 11 }),
  body('year').isInt({ min: 2020 }),
  validate,
  createTask
);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
module.exports = router;