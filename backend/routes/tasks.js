// routes/tasks.js
const express  = require('express');
const { body } = require('express-validator');
const router   = express.Router();

const {
  getTasks, createTask, updateTask, deleteTask,
} = require('../controllers/taskController');
const { protect }  = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// All task routes require auth
router.use(protect);

// GET  /api/tasks          — get all tasks (optional ?month=&year=)
// POST /api/tasks          — create a task
router
  .route('/')
  .get(getTasks)
  .post(
    [
      body('text').trim().notEmpty().withMessage('Task text is required'),
      body('day').isInt({ min: 1, max: 31 }).withMessage('day must be 1–31'),
      body('month').isInt({ min: 0, max: 11 }).withMessage('month must be 0–11'),
      body('year').isInt({ min: 2020 }).withMessage('year must be ≥ 2020'),
    ],
    validate,
    createTask
  );

// PATCH  /api/tasks/:id   — update task (toggle done, edit, postpone)
// DELETE /api/tasks/:id   — delete task
router
  .route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

module.exports = router;
