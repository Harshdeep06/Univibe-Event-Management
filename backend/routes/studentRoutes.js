const express = require('express');
const {
  getStudentDashboard,
  getStudentAttendance,
  getNotifications,
  markNotificationsRead,
  getCalendarEvents,
  getLeaderboard,
  getAnnouncements,
  toggleBookmark
} = require('../controllers/studentController');
const { protect, optionalProtect } = require('../middleware/auth');

const router = express.Router();


router.get('/leaderboard', getLeaderboard);
router.get('/announcements', optionalProtect, getAnnouncements);


router.get('/dashboard', protect, getStudentDashboard);
router.get('/attendance', protect, getStudentAttendance);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);
router.get('/calendar', protect, getCalendarEvents);
router.post('/bookmarks/:eventId', protect, toggleBookmark);

module.exports = router;
