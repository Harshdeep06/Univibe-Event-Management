const mongoose = require('mongoose');

const ClubMemberSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'officer'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});


ClubMemberSchema.index({ club: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('ClubMember', ClubMemberSchema);
