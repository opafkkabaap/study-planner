// models/Task.js
//
// A task belongs to a user and lives on a specific calendar date.
// The frontend stores date as { date (day number), month (0-indexed), year }.
// We mirror that here AND store a proper JS Date for easy sorting/querying.

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
    // Numeric fields mirroring the frontend's format
    day: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },
    month: {
      // 0-indexed, same as JS Date
      type: Number,
      required: true,
      min: 0,
      max: 11,
    },
    year: {
      type: Number,
      required: true,
    },
    // Computed ISO date for range queries
    dueDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-compute dueDate before every save
taskSchema.pre('save', function () {
  this.dueDate = new Date(this.year, this.month, this.day);
});
// Compound index so "give me all tasks for user X in month Y, year Z" is fast
taskSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Task', taskSchema);
