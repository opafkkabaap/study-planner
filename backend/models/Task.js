const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    // Add / replace these two fields in your Task schema
estimatedCompletion: { type: Date, default: null },   // ← NEW name (was estimatedDate)
completedAt:         { type: Date, default: null },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Task text is required'],
      trim: true,
      maxlength: [300, 'Task text cannot exceed 300 characters'],
    },
    done: {
      type: Boolean,
      default: false,
    },
    day:   { type: Number, required: true, min: 1, max: 31 },
    month: { type: Number, required: true, min: 0, max: 11 },
    year:  { type: Number, required: true },
    dueDate:       { type: Date },
    estimatedDate: { type: Date, default: null },
    completedAt:   { type: Date, default: null },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
