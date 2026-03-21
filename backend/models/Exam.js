// models/Exam.js
//
// The frontend stores exams as { title, subject, date: "DD/MM/YYYY" }.
// We parse and store each part separately for clean querying, and keep
// the original string for easy display.

const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Exam title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    // Keep original string for display (DD/MM/YYYY)
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in DD/MM/YYYY format'],
    },
    // Parsed for queries / sorting
    examDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Parse date string into a proper Date before saving
examSchema.pre('save', function () {
  const [d, m, y] = this.date.split('/').map(Number);
  this.examDate = new Date(y, m - 1, d);
});

examSchema.index({ user: 1, examDate: 1 });

module.exports = mongoose.model('Exam', examSchema);
