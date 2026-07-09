const Event = require('../models/Event');
const Club = require('../models/Club');
const Registration = require('../models/Registration');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const Notification = require('../models/Notification');
const { v4: uuidv4 } = require('uuid');




exports.getEvents = async (req, res, next) => {
  try {
    const { category, clubId, status, difficulty, search, date } = req.query;
    const query = {};

    
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    if (category) query.category = category;
    if (clubId) query.organizerClub = clubId;
    if (difficulty) query.difficulty = difficulty;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.setHours(0,0,0,0));
      const endOfDay = new Date(queryDate.setHours(23,59,59,999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }

    const events = await Event.find(query)
      .populate('organizerClub', 'name logo')
      .sort({ date: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (err) {
    next(err);
  }
};




exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizerClub', 'name logo facultyCoordinator clubHead');
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    
    const feedbackList = await Feedback.find({ event: event._id })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name avatar' }
      });

    res.status(200).json({ success: true, event, feedback: feedbackList });
  } catch (err) {
    next(err);
  }
};




exports.createEvent = async (req, res, next) => {
  try {
    const {
      name, description, category, organizerClubId, organizerClub, building, room, mapCoords, venue,
      date, time, registrationDeadline, maxParticipants, rules, prizes, requirements,
      certificateEnabled, attendanceRequired, difficulty
    } = req.body;

    const orgClubId = organizerClubId || organizerClub;
    const club = await Club.findById(orgClubId);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Organizer club not found' });
    }

    if (req.user.role !== 'super_admin' && (!club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to create events for this club' });
    }

    const status = req.user.role === 'super_admin' ? 'published' : 'pending_approval';

    const eventIdUuid = uuidv4();
    const qrCodeUrl = `/uploads/qr-events-${eventIdUuid}.png`;

    const vBuilding = building || (venue && venue.building) || '';
    const vRoom = room || (venue && venue.room) || '';
    const vMapCoords = mapCoords || (venue && venue.mapCoords) || '';

    const regDeadline = registrationDeadline || date;

    const event = await Event.create({
      name,
      description,
      category,
      organizerClub: club._id,
      venue: { building: vBuilding, room: vRoom, mapCoords: vMapCoords },
      date,
      time,
      registrationDeadline: regDeadline,
      maxParticipants,
      rules: rules || [],
      prizes: prizes || [],
      requirements: requirements || [],
      attendanceRequired: attendanceRequired !== undefined ? attendanceRequired : true,
      difficulty: difficulty || 'Beginner',
      status,
      qrCodeUrl
    });

    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};




exports.updateEvent = async (req, res, next) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const club = await Club.findById(event.organizerClub);
    
    if (req.user.role !== 'super_admin' && (!club || !club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this event' });
    }

    
    if (req.user.role === 'super_admin' && req.body.status) {
      event.status = req.body.status;
      if (req.body.status === 'published') {
        
        const members = await Student.find();
        const eventNotifications = members.map(m => ({
          recipient: m.user,
          message: `A new event has been announced: ${event.name}! Register now.`,
          type: 'event'
        }));
        if (eventNotifications.length > 0) {
          await Notification.insertMany(eventNotifications);
        }
      }
    }

    
    const allowedUpdates = [
      'name', 'description', 'category', 'date', 'time', 'registrationDeadline',
      'maxParticipants', 'rules', 'prizes', 'requirements',
      'attendanceRequired', 'difficulty', 'venue'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        event[field] = req.body[field];
      }
    });

    await event.save();
    res.status(200).json({ success: true, event });
  } catch (err) {
    next(err);
  }
};




exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const club = await Club.findById(event.organizerClub);
    if (req.user.role !== 'super_admin' && (!club || !club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this event' });
    }

    await Event.findByIdAndDelete(req.params.id);
    await Registration.deleteMany({ event: req.params.id });
    await Attendance.deleteMany({ event: req.params.id });

    res.status(200).json({ success: true, message: 'Event successfully removed' });
  } catch (err) {
    next(err);
  }
};




exports.registerForEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.status !== 'published') {
      return res.status(400).json({ success: false, error: 'Event is not open for registrations' });
    }

    
    if (new Date(event.registrationDeadline) < new Date()) {
      return res.status(400).json({ success: false, error: 'Registration deadline has passed' });
    }

    
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ success: false, error: 'Only student accounts can register' });
    }

    
    const currentRegsCount = await Registration.countDocuments({ event: event._id, status: 'registered' });
    if (currentRegsCount >= event.maxParticipants) {
      return res.status(400).json({ success: false, error: 'Event has reached maximum capacity' });
    }

    
    const existingRegistration = await Registration.findOne({ event: event._id, student: student._id });
    if (existingRegistration) {
      if (existingRegistration.status === 'registered') {
        return res.status(400).json({ success: false, error: 'Already registered for this event' });
      } else if (existingRegistration.status === 'pending') {
        return res.status(400).json({ success: false, error: 'Registration request is pending approval' });
      } else {
        existingRegistration.status = 'pending';
        existingRegistration.registrationDate = Date.now();
        await existingRegistration.save();
        return res.status(200).json({ success: true, message: 'Registration request sent and pending approval', registration: existingRegistration });
      }
    }

    const ticketCode = `TKT-${uuidv4().substring(0, 8).toUpperCase()}`;
    const qrCodeUrl = `/uploads/tickets-qr-${ticketCode}.png`;

    const registration = await Registration.create({
      event: event._id,
      student: student._id,
      ticketCode,
      qrCodeUrl,
      status: 'pending'
    });

    const Club = require('../models/Club');
    const club = await Club.findById(event.organizerClub);
    let notifyRecipient = null;
    if (club && club.clubHead) {
      notifyRecipient = club.clubHead;
    } else {
      const User = require('../models/User');
      const superAdminUser = await User.findOne({ role: 'super_admin' });
      if (superAdminUser) notifyRecipient = superAdminUser._id;
    }

    if (notifyRecipient) {
      await Notification.create({
        recipient: notifyRecipient,
        message: `Student "${req.user.name}" requested to register for your event "${event.name}"`,
        type: 'event'
      });
    }

    await Notification.create({
      recipient: req.user.id,
      message: `Registration request submitted for "${event.name}". Awaiting admin approval.`,
      type: 'event'
    });

    res.status(201).json({ success: true, message: 'Registration request sent and pending approval', registration });
  } catch (err) {
    next(err);
  }
};




exports.cancelRegistration = async (req, res, next) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ success: false, error: 'Only student accounts can cancel' });
    }

    const registration = await Registration.findOne({ event: req.params.id, student: student._id });
    if (!registration) {
      return res.status(404).json({ success: false, error: 'No registration record found' });
    }

    registration.status = 'cancelled';
    await registration.save();

    res.status(200).json({ success: true, message: 'Registration cancelled successfully' });
  } catch (err) {
    next(err);
  }
};




exports.getRegistrations = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    let filter = { event: event._id };
    if (req.user.role === 'student') {
      const student = await Student.findOne({ user: req.user.id });
      if (!student) return res.status(400).json({ success: false, error: 'Student profile not found' });
      filter.student = student._id;
    } else {
      const club = await Club.findById(event.organizerClub);
      const isAuthorized = req.user.role === 'super_admin' || (club && club.clubHead && club.clubHead.equals(req.user.id));
      if (!isAuthorized) {
        return res.status(403).json({ success: false, error: 'Not authorized to view registrations' });
      }
    }

    const registrations = await Registration.find(filter)
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email rollNumber department' }
      });

    res.status(200).json({ success: true, count: registrations.length, registrations });
  } catch (err) {
    next(err);
  }
};




exports.markAttendance = async (req, res, next) => {
  try {
    const { ticketCode } = req.body;
    if (!ticketCode) {
      return res.status(400).json({ success: false, error: 'Please provide student ticket code' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    const club = await Club.findById(event.organizerClub);
    if (req.user.role !== 'super_admin' && (!club || !club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to scan attendance' });
    }

    
    const registration = await Registration.findOne({ event: event._id, ticketCode }).populate('student');
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Invalid Ticket Code. No matching registration found.' });
    }

    if (registration.status === 'attended') {
      return res.status(400).json({ success: false, error: 'Attendance already checked in' });
    }

    const finalBadge = `${event.category} Enthusiast`;

    // Mark as attended
    registration.status = 'attended';
    await registration.save();

    // Create attendance record
    const attendance = await Attendance.create({
      event: event._id,
      student: registration.student._id,
      status: 'present',
      markedBy: req.user.id,
      badgeAwarded: finalBadge
    });

    // Reward points
    const studentProfile = registration.student;
    studentProfile.rewardPoints += 50; 

    // Badges
    const badgesSet = new Set(studentProfile.badges);
    if (finalBadge) {
      badgesSet.add(finalBadge);
    }
    if (studentProfile.rewardPoints >= 100 && !badgesSet.has('Event Explorer')) {
      badgesSet.add('Event Explorer');
    }
    if (studentProfile.rewardPoints >= 300 && !badgesSet.has('Super Scholar')) {
      badgesSet.add('Super Scholar');
    }
    if (studentProfile.rewardPoints >= 500 && !badgesSet.has('UNIVIBE Champion')) {
      badgesSet.add('UNIVIBE Champion');
    }
    studentProfile.badges = Array.from(badgesSet);
    await studentProfile.save();

    await Notification.create({
      recipient: studentProfile.user,
      message: `Your attendance for "${event.name}" has been marked. You earned the "${finalBadge}" badge and +50 points!`,
      type: 'info'
    });

    res.status(200).json({
      success: true,
      message: 'Attendance checked in successfully',
      studentName: studentProfile.rollNumber,
      rewardPoints: studentProfile.rewardPoints,
      badgeAwarded: finalBadge
    });
  } catch (err) {
    next(err);
  }
};




exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ success: false, error: 'Only student accounts can leave reviews' });
    }

    
    const attended = await Registration.findOne({ event: req.params.id, student: student._id, status: 'attended' });
    if (!attended) {
      return res.status(400).json({ success: false, error: 'You must attend the event to leave feedback' });
    }

    
    const feedbackCheck = await Feedback.findOne({ event: req.params.id, student: student._id });
    if (feedbackCheck) {
      return res.status(400).json({ success: false, error: 'Feedback already submitted' });
    }

    const feedback = await Feedback.create({
      event: req.params.id,
      student: student._id,
      rating,
      comment
    });

    res.status(201).json({ success: true, feedback });
  } catch (err) {
    next(err);
  }
};

exports.resolveEventRegistration = async (req, res, next) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action. Choose approve or reject.' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check auth: only super admin or club head can resolve
    const Club = require('../models/Club');
    const club = await Club.findById(event.organizerClub);
    const isAuthorized = req.user.role === 'super_admin' || (club && club.clubHead && club.clubHead.equals(req.user.id));
    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Not authorized to manage registrations for this event' });
    }

    const registration = await Registration.findById(req.params.regId).populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' }
    });
    if (!registration) {
      return res.status(404).json({ success: false, error: 'Registration not found' });
    }

    registration.resolvedBy = req.user._id;
    registration.resolvedByName = req.user.name;

    if (action === 'approve') {
      registration.status = 'registered';
      await registration.save();

      // Notify student
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: registration.student.user._id,
        message: `Your registration request for "${event.name}" was APPROVED by ${req.user.name}! Ticket Code: ${registration.ticketCode}`,
        type: 'event'
      });
    } else {
      registration.status = 'cancelled';
      await registration.save();

      // Notify student
      const Notification = require('../models/Notification');
      await Notification.create({
        recipient: registration.student.user._id,
        message: `Your registration request for "${event.name}" was rejected by ${req.user.name}.`,
        type: 'event'
      });
    }

    res.status(200).json({ success: true, message: `Registration successfully ${action}d` });
  } catch (err) {
    next(err);
  }
};

