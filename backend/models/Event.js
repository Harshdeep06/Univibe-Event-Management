const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an event name'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add an event description']
  },
  category: {
    type: String,
    required: [true, 'Please add an event category (e.g. Hackathon, Quiz, Music)'],
    trim: true
  },
  organizerClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true
  },
  venue: {
    building: {
      type: String,
      required: [true, 'Please specify the building']
    },
    room: {
      type: String,
      required: [true, 'Please specify the room/hall']
    },
    mapCoords: {
      type: String,
      default: '' 
    }
  },
  date: {
    type: Date,
    required: [true, 'Please specify the event date']
  },
  time: {
    type: String,
    required: [true, 'Please specify the event time (e.g., 14:00)']
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Please specify the registration deadline']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Please specify maximum participants']
  },
  posterUrl: {
    type: String,
    default: ''
  },
  rules: {
    type: [String],
    default: []
  },
  prizes: {
    type: [String],
    default: []
  },
  requirements: {
    type: [String],
    default: []
  },
  attendanceRequired: {
    type: Boolean,
    default: true
  },
  qrCodeUrl: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  status: {
    type: String,
    enum: ['draft', 'pending_approval', 'published', 'cancelled'],
    default: 'pending_approval'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Event', EventSchema);
