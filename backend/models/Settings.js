const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  homepageBanner: {
    type: String,
    default: ''
  },
  homepageCarousel: {
    type: [String],
    default: []
  },
  universityNews: [{
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  universityCalendar: [{
    title: { type: String, required: true },
    date: { type: Date, required: true }
  }]
});

module.exports = mongoose.model('Settings', SettingsSchema);
