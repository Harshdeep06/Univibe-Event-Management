const Club = require('../models/Club');
const ClubMember = require('../models/ClubMember');
const Student = require('../models/Student');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');




exports.getClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find().populate('clubHead', 'name email');
    res.status(200).json({ success: true, clubs });
  } catch (err) {
    next(err);
  }
};




exports.getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id).populate('clubHead', 'name email');
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    
    const members = await ClubMember.find({ club: club._id, status: 'approved' })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' }
      });

    res.status(200).json({ success: true, club, members });
  } catch (err) {
    next(err);
  }
};




exports.joinClubRequest = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ success: false, error: 'Only student accounts can join clubs' });
    }

    
    const existingMember = await ClubMember.findOne({ club: club._id, student: student._id });
    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: `Membership status is already: ${existingMember.status}`
      });
    }

    const request = await ClubMember.create({
      club: club._id,
      student: student._id,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Membership request submitted successfully', request });
  } catch (err) {
    next(err);
  }
};




exports.getJoinRequests = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    
    if (req.user.role !== 'super_admin' && (!club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to view requests for this club' });
    }

    const requests = await ClubMember.find({ club: club._id, status: 'pending' })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email rollNumber' }
      });

    res.status(200).json({ success: true, requests });
  } catch (err) {
    next(err);
  }
};




exports.resolveJoinRequest = async (req, res, next) => {
  try {
    const { action } = req.body; 
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Invalid action. Specify approve or reject.' });
    }

    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    
    if (req.user.role !== 'super_admin' && (!club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to manage this club' });
    }

    const memberRequest = await ClubMember.findById(req.params.requestId).populate({
      path: 'student',
      populate: { path: 'user', select: 'name email' }
    });
    if (!memberRequest) {
      return res.status(404).json({ success: false, error: 'Request not found' });
    }

    if (action === 'approve') {
      memberRequest.status = 'approved';
      await memberRequest.save();

      
      club.membersCount = await ClubMember.countDocuments({ club: club._id, status: 'approved' });
      await club.save();

      
      await Notification.create({
        recipient: memberRequest.student.user._id,
        message: `Your request to join ${club.name} was APPROVED!`,
        type: 'club'
      });
    } else {
      memberRequest.status = 'rejected';
      await memberRequest.save();

      await Notification.create({
        recipient: memberRequest.student.user._id,
        message: `Your request to join ${club.name} was rejected.`,
        type: 'club'
      });
    }

    res.status(200).json({ success: true, message: `Request successfully ${memberRequest.status}` });
  } catch (err) {
    next(err);
  }
};




exports.getClubMembers = async (req, res, next) => {
  try {
    const members = await ClubMember.find({ club: req.params.id, status: 'approved' })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email avatar' }
      });
    res.status(200).json({ success: true, members });
  } catch (err) {
    next(err);
  }
};




exports.postAnnouncement = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    const club = await Club.findById(req.params.id);

    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    
    if (req.user.role !== 'super_admin' && (!club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized to post to this club' });
    }

    const announcement = await Announcement.create({
      title,
      content,
      club: club._id,
      createdBy: req.user.id
    });

    
    const members = await ClubMember.find({ club: club._id, status: 'approved' })
      .populate('student');
    const notifications = members.map(m => ({
      recipient: m.student.user,
      message: `New Announcement in ${club.name}: ${title}`,
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

exports.getClubEventRequests = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);
    if (!club) {
      return res.status(404).json({ success: false, error: 'Club not found' });
    }

    if (req.user.role !== 'super_admin' && (!club.clubHead || !club.clubHead.equals(req.user.id))) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const Event = require('../models/Event');
    const Registration = require('../models/Registration');
    const events = await Event.find({ organizerClub: club._id });
    const eventIds = events.map(e => e._id);

    const registrations = await Registration.find({ event: { $in: eventIds }, status: 'pending' })
      .populate('event', 'name')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });

    res.status(200).json({ success: true, requests: registrations });
  } catch (err) {
    next(err);
  }
};
