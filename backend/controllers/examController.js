// controllers/examController.js
const Exam = require('../models/Exam');

// ── GET /api/exams ──────────────────────────────────────────────────
exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ user: req.user._id }).sort({ examDate: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/exams ─────────────────────────────────────────────────
exports.createExam = async (req, res) => {
  try {
    const { title, subject, date } = req.body;

    const exam = await Exam.create({
      user: req.user._id,
      title,
      subject,
      date, // "DD/MM/YYYY" – pre-save hook parses this into examDate
    });

    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── PUT /api/exams/:id ──────────────────────────────────────────────
exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const { title, subject, date } = req.body;
    if (title)   exam.title   = title;
    if (subject) exam.subject = subject;
    if (date)    exam.date    = date; // pre-save hook will recompute examDate

    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ── DELETE /api/exams/:id ───────────────────────────────────────────
exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
