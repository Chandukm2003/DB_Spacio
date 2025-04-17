const mongoose = require('mongoose');

const serialTrackerSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true, // Ensure only one record per year
  },
  serial_no: {
    type: Number,
    required: true,
  },
});

const SerialTracker = mongoose.model('SerialTracker', serialTrackerSchema);

module.exports = SerialTracker;