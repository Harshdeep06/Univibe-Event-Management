const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: [true, 'Please add a roll number'],
    unique: true,
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Please add a department/branch'],
    trim: true
  },
  yearOfStudy: {
    type: Number,
    required: [true, 'Please add the year of study (1-4)'],
    min: 1,
    max: 5
  },
  rewardPoints: {
    type: Number,
    default: 0
  },
  badges: {
    type: [String],
    default: []
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Student', StudentSchema);
