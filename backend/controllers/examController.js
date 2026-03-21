const Exam = require('../models/Exam');

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find({ user: req.user._id }).sort({ examDate: 1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createExam = async (req, res) => {
  try {
    const { title, subject, date } = req.body;
    const [d, m, y] = date.split('/').map(Number);
    const exam = await Exam.create({
      user: req.user._id,
      title,
      subject,
      date,
      examDate: new Date(y, m - 1, d),
    });
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findOne({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    const { title, subject, date } = req.body;
    if (title)   exam.title   = title;
    if (subject) exam.subject = subject;
    if (date) {
      exam.date = date;
      const [d, m, y] = date.split('/').map(Number);
      exam.examDate = new Date(y, m - 1, d);
    }
    await exam.save();
    res.json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json({ message: 'Exam deleted', id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
