const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
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
    dueDate: { type: Date },
  },
  { timestamps: true }
);

taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
