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
    date: {
      type: String,
      required: [true, 'Date is required'],
      match: [/^\d{2}\/\d{2}\/\d{4}$/, 'Date must be in DD/MM/YYYY format'],
    },
    examDate: { type: Date },
  },
  { timestamps: true }
);

examSchema.index({ user: 1, examDate: 1 });

module.exports = mongoose.model('Exam', examSchema);
