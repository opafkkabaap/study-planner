// controllers/taskController.js
const Task = require('../models/Task');

// ── GET /api/tasks  ─────────────────────────────────────────────────
// Optional query params: ?month=1&year=2026  (0-indexed month)
exports.getTasks = async (req, res) => {
  try {
    const filter = { user: req.user._id };

    // Allow filtering by month/year for performance
    if (req.query.month !== undefined && req.query.year !== undefined) {
      const m = Number(req.query.month);
      const y = Number(req.query.year);
      // All dates within that month
      filter.dueDate = {
        $gte: new Date(y, m, 1),
        $lt: new Date(y, m + 1, 1),
      };
    }

    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/tasks ─────────────────────────────────────────────────
exports.createTask = async (req, res) => {
  try {
    const { text, day, month, year } = req.body;

    const task = await Task.create({
      user: req.user._id,
      text,
      day,
      month,
      year,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PATCH /api/tasks/:id ────────────────────────────────────────────
// Supports toggling done, editing text, and postponing (changing date)
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const allowedFields = ['text', 'done', 'day', 'month', 'year'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save(); // triggers pre-save to recompute dueDate
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/tasks/:id ───────────────────────────────────────────
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
