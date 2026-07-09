const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  ticketCode: {
    type: String,
    required: true,
    unique: true
  },
  qrCodeUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'registered', 'cancelled', 'attended'],
    default: 'pending'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  resolvedByName: {
    type: String,
    default: ''
  }
});


RegistrationSchema.index({ event: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Registration', RegistrationSchema);
