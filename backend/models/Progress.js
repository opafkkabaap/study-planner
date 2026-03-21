// models/Progress.js
//
// Stores study-hours entries per user per day.
// The Progress page shows weekly/monthly/yearly bar charts with two series
// (the frontend currently hard-codes "Maths" and "Physics").
// We store subject + hours per entry so it's flexible for future subjects.

const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    hours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    // The calendar date this entry is for
    day: { type: Number, required: true, min: 1, max: 31 },
    month: { type: Number, required: true, min: 0, max: 11 }, // 0-indexed
    year: { type: Number, required: true },
    logDate: { type: Date, required: true },
  },
  { timestamps: true }
);

progressSchema.pre('save', function (next) {
  this.logDate = new Date(this.year, this.month, this.day);
  next();
});

progressSchema.index({ user: 1, logDate: 1, subject: 1 });

module.exports = mongoose.model('Progress', progressSchema);
