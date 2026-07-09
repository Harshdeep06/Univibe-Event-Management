const express = require('express');
const {
  getClubs,
  getClubById,
  joinClubRequest,
  getJoinRequests,
  resolveJoinRequest,
  getClubMembers,
  postAnnouncement,
  getClubEventRequests
} = require('../controllers/clubController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', getClubs);
router.get('/:id', getClubById);
router.get('/:id/members', getClubMembers);


router.post('/:id/join', protect, joinClubRequest);
router.get('/:id/requests', protect, getJoinRequests);
router.post('/:id/requests/:requestId', protect, resolveJoinRequest);
router.post('/:id/announcements', protect, postAnnouncement);
router.get('/:id/event-requests', protect, getClubEventRequests);

module.exports = router;
