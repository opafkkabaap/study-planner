const Progress = require('../models/Progress');

exports.getProgress = async (req, res) => {
  try {
    const { view = 'week', month, year } = req.query;
    const m = Number(month ?? new Date().getMonth());
    const y = Number(year  ?? new Date().getFullYear());
    const startDate = view === 'year' ? new Date(y, 0, 1)  : new Date(y, m, 1);
    const endDate   = view === 'year' ? new Date(y, 11, 31) : new Date(y, m + 1, 0);
    const entries = await Progress.find({
      user: req.user._id,
      logDate: { $gte: startDate, $lte: endDate },
    }).sort({ logDate: 1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.logProgress = async (req, res) => {
  try {
    const { subject, hours, day, month, year } = req.body;
    const entry = await Progress.findOneAndUpdate(
      { user: req.user._id, subject, day, month, year },
      { hours, logDate: new Date(year, month, day) },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTodayTotal = async (req, res) => {
  try {
    const now = new Date();
    const entries = await Progress.find({
      user: req.user._id,
      day:   now.getDate(),
      month: now.getMonth(),
      year:  now.getFullYear(),
    });
    const total = entries.reduce((sum, e) => sum + e.hours, 0);
    res.json({ total, entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
