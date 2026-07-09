const Student = require('../models/Student');
const User = require('../models/User');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');




exports.getStudentDashboard = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    
    const registeredCount = await Registration.countDocuments({ student: student._id, status: 'registered' });
    const attendedCount = await Registration.countDocuments({ student: student._id, status: 'attended' });

    
    const Attendance = require('../models/Attendance');
    const attendanceCount = await Attendance.countDocuments({ student: student._id });

    const nextRegistration = await Registration.findOne({ student: student._id, status: 'registered' })
      .populate({
        path: 'event',
        match: { date: { $gte: new Date() } }
      });

    res.status(200).json({
      success: true,
      stats: {
        registeredEvents: registeredCount + attendanceCount,
        attendedEvents: attendanceCount,
        rewardPoints: student.rewardPoints,
        certificates: student.badges ? student.badges.length : 0,
        badges: student.badges
      },
      nextEvent: nextRegistration ? nextRegistration.event : null
    });
  } catch (err) {
    next(err);
  }
};




exports.getStudentAttendance = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    const Attendance = require('../models/Attendance');
    const attendanceLogs = await Attendance.find({ student: student._id })
      .populate({
        path: 'event',
        select: 'name date time category organizerClub',
        populate: { path: 'organizerClub', select: 'name logo' }
      });

    res.status(200).json({ success: true, attendance: attendanceLogs });
  } catch (err) {
    next(err);
  }
};




exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};




exports.markNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'Notifications marked read' });
  } catch (err) {
    next(err);
  }
};




exports.getCalendarEvents = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    const registrations = await Registration.find({
      student: student._id,
      status: { $in: ['registered', 'attended'] }
    }).populate('event');

    const events = registrations.map(r => r.event).filter(Boolean);

    res.status(200).json({ success: true, events });
  } catch (err) {
    next(err);
  }
};




exports.getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await Student.find()
      .populate('user', 'name avatar')
      .sort({ rewardPoints: -1 })
      .limit(10);
    res.status(200).json({ success: true, leaderboard });
  } catch (err) {
    next(err);
  }
};




exports.getAnnouncements = async (req, res, next) => {
  try {
    let query = {};

    if (req.user && req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (student) {
        const memberships = await require('../models/ClubMember').find({ student: student._id, status: 'approved' });
        const clubIds = memberships.map(m => m.club);
        query = {
          $or: [
            { club: null },
            { club: { $in: clubIds } }
          ]
        };
      } else {
        query = { club: null };
      }
    } else if (req.user && req.user.role === 'club_admin') {
      const Club = require('../models/Club');
      const userClubs = await Club.find({ clubHead: req.user.id });
      const userClubIds = userClubs.map(c => c._id);
      query = {
        $or: [
          { club: null },
          { club: { $in: userClubIds } },
          { createdBy: req.user.id }
        ]
      };
    } else if (req.user && req.user.role === 'super_admin') {
      query = {};
    } else {
      query = { club: null };
    }

    const announcements = await Announcement.find(query)
      .populate('club', 'name logo')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, announcements });
  } catch (err) {
    next(err);
  }
};




exports.toggleBookmark = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const idx = student.bookmarks.indexOf(req.params.eventId);
    if (idx > -1) {
      student.bookmarks.splice(idx, 1);
      await student.save();
      return res.status(200).json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    } else {
      student.bookmarks.push(req.params.eventId);
      await student.save();
      return res.status(200).json({ success: true, bookmarked: true, message: 'Event bookmarked' });
    }
  } catch (err) {
    next(err);
  }
};
