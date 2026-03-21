// controllers/progressController.js
const Progress = require('../models/Progress');

// ── GET /api/progress  ──────────────────────────────────────────────
// Query params: ?view=week|month|year&month=1&year=2026
// Returns aggregated hours per subject per period bucket (day/week/month)
exports.getProgress = async (req, res) => {
  try {
    const { view = 'week', month, year } = req.query;
    const m = Number(month ?? new Date().getMonth());
    const y = Number(year ?? new Date().getFullYear());

    let startDate, endDate;

    if (view === 'week') {
      // Current week (Mon–Sun) within the month
      startDate = new Date(y, m, 1);
      endDate   = new Date(y, m + 1, 0); // last day of month
    } else if (view === 'month') {
      startDate = new Date(y, m, 1);
      endDate   = new Date(y, m + 1, 0);
    } else {
      // year
      startDate = new Date(y, 0, 1);
      endDate   = new Date(y, 11, 31);
    }

    const entries = await Progress.find({
      user: req.user._id,
      logDate: { $gte: startDate, $lte: endDate },
    }).sort({ logDate: 1 });

    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/progress ──────────────────────────────────────────────
// Log hours studied for a subject on a day
exports.logProgress = async (req, res) => {
  try {
    const { subject, hours, day, month, year } = req.body;

    // Upsert: one record per user+subject+day
    const entry = await Progress.findOneAndUpdate(
      { user: req.user._id, subject, day, month, year },
      { hours },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── GET /api/progress/today ─────────────────────────────────────────
// Quick summary: total hours studied today
exports.getTodayTotal = async (req, res) => {
  try {
    const now = new Date();
    const entries = await Progress.find({
      user: req.user._id,
      day: now.getDate(),
      month: now.getMonth(),
      year: now.getFullYear(),
    });
    const total = entries.reduce((sum, e) => sum + e.hours, 0);
    res.json({ total, entries });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
