const mongoose = require('mongoose');

const ClubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a club name'],
    unique: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  banner: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Please add a club description']
  },
  facultyCoordinator: {
    type: String,
    default: ''
  },
  clubHead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  achievements: {
    type: [String],
    default: []
  },
  gallery: {
    type: [String],
    default: []
  },
  membersCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Club', ClubSchema);
