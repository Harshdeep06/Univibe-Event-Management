const express = require('express');
const {
  getStats,
  getStudents,
  updateStudentStatus,
  deleteStudent,
  createClub,
  updateClub,
  deleteClub,
  getPendingEvents,
  postGlobalAnnouncement,
  getAdminEvents,
  getEventRegistrations,
  manualMarkAttendance,
  updateStudentDetails,
  getPendingClubHeads,
  verifyClubHead,
  getStudentAttendanceAdmin,
  getVerifiedClubHeads
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('super_admin'));

router.get('/stats', getStats);
router.get('/students', getStudents);
router.put('/students/:id', updateStudentStatus);
router.delete('/students/:id', deleteStudent);
router.post('/clubs', createClub);
router.put('/clubs/:id', updateClub);
router.delete('/clubs/:id', deleteClub);
router.get('/events/pending', getPendingEvents);
router.post('/announcements', postGlobalAnnouncement);
router.get('/events', getAdminEvents);
router.get('/events/:id/registrations', getEventRegistrations);
router.post('/registrations/:id/attend', manualMarkAttendance);
router.put('/students/:id/details', updateStudentDetails);
router.get('/pending-club-heads', getPendingClubHeads);
router.post('/pending-club-heads/:id/resolve', verifyClubHead);
router.get('/students/:id/attendance', getStudentAttendanceAdmin);
router.get('/verified-club-heads', getVerifiedClubHeads);

module.exports = router;
