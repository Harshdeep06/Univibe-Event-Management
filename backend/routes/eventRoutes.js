const express = require('express');
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
  getRegistrations,
  markAttendance,
  submitFeedback,
  resolveEventRegistration
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);


router.post('/', protect, authorize('club_admin', 'super_admin'), createEvent);
router.put('/:id', protect, authorize('club_admin', 'super_admin'), updateEvent);
router.delete('/:id', protect, authorize('club_admin', 'super_admin'), deleteEvent);

router.post('/:id/register', protect, registerForEvent);
router.post('/:id/cancel', protect, cancelRegistration);
router.get('/:id/registrations', protect, getRegistrations);
router.post('/:id/mark-attendance', protect, authorize('club_admin', 'super_admin'), markAttendance);
router.post('/:id/feedback', protect, submitFeedback);
router.post('/:id/registrations/:regId/resolve', protect, authorize('club_admin', 'super_admin'), resolveEventRegistration);

module.exports = router;
