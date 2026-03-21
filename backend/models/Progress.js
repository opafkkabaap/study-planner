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
    day:   { type: Number, required: true, min: 1, max: 31 },
    month: { type: Number, required: true, min: 0, max: 11 },
    year:  { type: Number, required: true },
    logDate: { type: Date },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, logDate: 1, subject: 1 });

module.exports = mongoose.model('Progress', progressSchema);
