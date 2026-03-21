const Task = require('../models/Task');

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.month !== undefined && req.query.year !== undefined) {
      const m = Number(req.query.month);
      const y = Number(req.query.year);
      filter.dueDate = {
        $gte: new Date(y, m, 1),
        $lt:  new Date(y, m + 1, 1),
      };
    }
    const tasks = await Task.find(filter).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { text, day, month, year } = req.body;
    const task = await Task.create({
      user: req.user._id,
      text,
      day,
      month,
      year,
      dueDate: new Date(year, month, day),
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const allowedFields = ['text', 'done', 'day', 'month', 'year'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    // Recompute dueDate whenever date fields change
    task.dueDate = new Date(task.year, task.month, task.day);

    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
