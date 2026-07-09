const User = require('../models/User');
const Student = require('../models/Student');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ClubMember = require('../models/ClubMember');




exports.getStats = async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalClubs = await Club.countDocuments();
    const totalEvents = await Event.countDocuments({ status: 'published' });
    const totalRegistrations = await Registration.countDocuments();

    
    const upcomingEvents = await Event.find({
      date: { $gte: new Date() },
      status: 'published'
    })
      .populate('organizerClub', 'name logo')
      .sort({ date: 1 })
      .limit(5);

    
    const monthlyRegistrations = await Registration.aggregate([
      {
        $group: {
          _id: { $month: "$registrationDate" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const chartData = monthNames.map((name, index) => {
      const match = monthlyRegistrations.find(r => r._id === index + 1);
      return { month: name, count: match ? match.count : 0 };
    });

    
    const clubEvents = await Event.aggregate([
      { $group: { _id: "$organizerClub", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    let activeClubName = "None";
    if (clubEvents.length > 0) {
      const activeClubObj = await Club.findById(clubEvents[0]._id);
      if (activeClubObj) activeClubName = activeClubObj.name;
    }

    
    const studentRegs = await Registration.aggregate([
      { $group: { _id: "$student", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);
    let activeStudentName = "None";
    if (studentRegs.length > 0) {
      const activeStudentObj = await Student.findById(studentRegs[0]._id).populate('user', 'name');
      if (activeStudentObj && activeStudentObj.user) activeStudentName = activeStudentObj.user.name;
    }

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        totalClubs,
        totalEvents,
        totalRegistrations,
        activeClub: activeClubName,
        activeStudent: activeStudentName
      },
      upcomingEvents,
      chartData
    });
  } catch (err) {
    next(err);
  }
};




exports.getStudents = async (req, res, next) => {
  try {
    const { clubId } = req.query;
    let query = {};

    if (clubId) {
      const ClubMember = require('../models/ClubMember');
      const memberships = await ClubMember.find({ club: clubId, status: 'approved' });
      const studentIds = memberships.map(m => m.student);
      query._id = { $in: studentIds };
    }

    const students = await Student.find(query)
      .populate('user', 'name email avatar isVerified');

    const Attendance = require('../models/Attendance');
    const Registration = require('../models/Registration');
    const enrichedStudents = await Promise.all(students.map(async (s) => {
      const presenceCount = await Attendance.countDocuments({ student: s._id });
      const totalLecturesCount = await Registration.countDocuments({ student: s._id });
      return {
        ...s.toObject(),
        presenceCount,
        totalLecturesCount
      };
    }));

    res.status(200).json({ success: true, students: enrichedStudents });
  } catch (err) {
    next(err);
  }
};




exports.updateStudentStatus = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const { isVerified } = req.body;
    const user = await User.findById(student.user);
    if (user) {
      user.isVerified = isVerified;
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Student status updated successfully' });
  } catch (err) {
    next(err);
  }
};




exports.deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    
    await User.findByIdAndDelete(student.user);
    await Student.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ student: req.params.id });
    await ClubMember.deleteMany({ student: req.params.id });

    res.status(200).json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    next(err);
  }
};




exports.createClub = async (req, res, next) => {
  try {
    const { name, description, clubHeadId } = req.body;

    const clubExists = await Club.findOne({ name });
    if (clubExists) {
      return res.status(400).json({ success: false, error: 'Club name already exists' });
    }

    let clubHeadUser = null;
    if (clubHeadId) {
      clubHeadUser = await User.findById(clubHeadId);
      if (!clubHeadUser) {
        return res.status(400).json({ success: false, error: 'Selected club head not found' });
      }
      
      clubHeadUser.role = 'club_admin';
      await clubHeadUser.save();
    }

    const club = await Club.create({
      name,
      description,
      clubHead: clubHeadUser ? clubHeadUser._id : null
    });

    res.status(201).json({ success: true, club });
  } catch (err) {
    next(err);
  }
};




exports.updateClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    const { name, description, clubHeadId } = req.body;

    let clubHeadUser = null;
    if (clubHeadId) {
      clubHeadUser = await User.findById(clubHeadId);
      if (!clubHeadUser) {
        return res.status(400).json({ success: false, error: 'Selected club head not found' });
      }
      
      if (club.clubHead && !club.clubHead.equals(clubHeadUser._id)) {
        const prevHead = await User.findById(club.clubHead);
        if (prevHead) {
          prevHead.role = 'student';
          await prevHead.save();
        }
      }
      
      clubHeadUser.role = 'club_admin';
      await clubHeadUser.save();
      club.clubHead = clubHeadUser._id;
    }

    club.name = name || club.name;
    club.description = description || club.description;

    await club.save();
    res.status(200).json({ success: true, club });
  } catch (err) {
    next(err);
  }
};




exports.deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    
    if (club.clubHead) {
      const head = await User.findById(club.clubHead);
      if (head) {
        head.role = 'student';
        await head.save();
      }
    }

    await Club.findByIdAndDelete(req.params.id);
    await Event.deleteMany({ organizerClub: req.params.id });
    await ClubMember.deleteMany({ club: req.params.id });

    res.status(200).json({ success: true, message: 'Club deleted successfully' });
  } catch (err) {
    next(err);
  }
};




exports.getPendingEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ status: 'pending_approval' })
      .populate('organizerClub', 'name logo');
    res.status(200).json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

exports.postGlobalAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const Announcement = require('../models/Announcement');
    const announcement = await Announcement.create({
      title,
      content,
      club: null,
      createdBy: req.user.id
    });

    const User = require('../models/User');
    const Notification = require('../models/Notification');
    const students = await User.find({ role: 'student' });
    const notifications = students.map(s => ({
      recipient: s._id,
      message: `Global Announcement: ${title}`,
      type: 'info'
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    res.status(201).json({ success: true, announcement });
  } catch (err) {
    next(err);
  }
};

exports.getAdminEvents = async (req, res, next) => {
  try {
    const events = await Event.find().populate('organizerClub', 'name');
    res.status(200).json({ success: true, events });
  } catch (err) {
    next(err);
  }
};

exports.getEventRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });

    const Attendance = require('../models/Attendance');
    const enriched = await Promise.all(registrations.map(async (r) => {
      if (!r.student) return r.toObject();
      const attendance = await Attendance.findOne({ event: r.event, student: r.student._id });
      const presenceCount = await Attendance.countDocuments({ student: r.student._id });
      const totalLecturesCount = await Registration.countDocuments({ student: r.student._id });
      return {
        ...r.toObject(),
        scanTime: attendance ? attendance.scanTime : null,
        presenceCount,
        totalLecturesCount
      };
    }));

    res.status(200).json({ success: true, registrations: enriched });
  } catch (err) {
    next(err);
  }
};

exports.manualMarkAttendance = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('student');
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }
    if (registration.status === 'attended') {
      return res.status(400).json({ success: false, error: 'Student already marked attended' });
    }

    const event = await Event.findById(registration.event);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const { badgeName, points } = req.body;
    const finalBadge = badgeName && badgeName.trim() ? badgeName.trim() : `${event.category} Enthusiast`;
    const pointsToAward = points !== undefined ? Number(points) : 50;

    // Mark as attended
    registration.status = 'attended';
    await registration.save();

    // Create attendance record
    const Attendance = require('../models/Attendance');
    await Attendance.create({
      event: event._id,
      student: registration.student._id,
      status: 'present',
      markedBy: req.user.id,
      badgeAwarded: finalBadge
    });

    // Reward points
    const studentProfile = registration.student;
    studentProfile.rewardPoints += pointsToAward;

    // Badges
    const badgesSet = new Set(studentProfile.badges);
    if (finalBadge) {
      badgesSet.add(finalBadge);
    }
    if (studentProfile.rewardPoints >= 100 && !badgesSet.has('Event Explorer')) badgesSet.add('Event Explorer');
    if (studentProfile.rewardPoints >= 300 && !badgesSet.has('Super Scholar')) badgesSet.add('Super Scholar');
    if (studentProfile.rewardPoints >= 500 && !badgesSet.has('UNIVIBE Champion')) badgesSet.add('UNIVIBE Champion');
    studentProfile.badges = Array.from(badgesSet);
    await studentProfile.save();

    // Notify student of attendance and badge
    const Notification = require('../models/Notification');
    await Notification.create({
      recipient: studentProfile.user,
      message: `Your attendance for "${event.name}" has been marked. You earned the "${finalBadge}" badge and +50 points!`,
      type: 'info'
    });

    res.status(200).json({
      success: true,
      message: 'Attendance marked and badge awarded successfully',
      badgeAwarded: finalBadge
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStudentDetails = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    const { name, rollNumber, department, yearOfStudy, rewardPoints, badges } = req.body;
    student.rollNumber = rollNumber || student.rollNumber;
    student.department = department || student.department;
    student.yearOfStudy = yearOfStudy !== undefined ? yearOfStudy : student.yearOfStudy;
    student.rewardPoints = rewardPoints !== undefined ? rewardPoints : student.rewardPoints;
    if (badges !== undefined) {
      student.badges = badges.split(',').map(b => b.trim()).filter(b => b.length > 0);
    }
    const badgesSet = new Set(student.badges);
    if (student.rewardPoints >= 100 && !badgesSet.has('Event Explorer')) badgesSet.add('Event Explorer');
    if (student.rewardPoints >= 300 && !badgesSet.has('Super Scholar')) badgesSet.add('Super Scholar');
    if (student.rewardPoints >= 500 && !badgesSet.has('UNIVIBE Champion')) badgesSet.add('UNIVIBE Champion');
    student.badges = Array.from(badgesSet);

    await student.save();

    const user = await User.findById(student.user);
    if (user && name) {
      user.name = name;
      await user.save();
    }

    res.status(200).json({ success: true, message: 'Student details updated successfully' });
  } catch (err) {
    next(err);
  }
};

exports.getPendingClubHeads = async (req, res, next) => {
  try {
    const pendingHeads = await User.find({ role: 'club_admin', isVerified: false });
    res.status(200).json({ success: true, pendingHeads });
  } catch (err) {
    next(err);
  }
};

exports.verifyClubHead = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const { action } = req.body;
    if (action === 'approve') {
      user.isVerified = true;
      await user.save();

      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: user._id,
        message: 'Congratulations! Your Club Head account has been verified by the Super Admin. You can now login.',
        type: 'info'
      });
    } else {
      await User.findByIdAndDelete(req.params.id);
    }
    res.status(200).json({ success: true, message: `Club Head registration successfully ${action}d` });
  } catch (err) {
    next(err);
  }
};

exports.getStudentAttendanceAdmin = async (req, res, next) => {
  try {
    const Attendance = require('../models/Attendance');
    const logs = await Attendance.find({ student: req.params.id })
      .populate('event', 'name date time category');
    res.status(200).json({ success: true, attendance: logs });
  } catch (err) {
    next(err);
  }
};

exports.getVerifiedClubHeads = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const heads = await User.find({ role: 'club_admin', isVerified: true });
    res.status(200).json({ success: true, heads });
  } catch (err) {
    next(err);
  }
};

