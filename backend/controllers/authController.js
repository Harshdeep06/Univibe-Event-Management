const User = require('../models/User');
const Student = require('../models/Student');
const Club = require('../models/Club');
const jwt = require('jsonwebtoken');


const getSignedToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'univibe_super_secret_jwt_key_2026_987654321',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};


const sendTokenResponse = (user, statusCode, res) => {
  const token = getSignedToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
};




exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, rollNumber, department, yearOfStudy } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    if (role === 'club_admin') {
      user = await User.create({
        name,
        email,
        password,
        role: 'club_admin',
        isVerified: false
      });
      return res.status(201).json({ success: true, message: 'Club Head registration submitted. Awaiting Super Admin verification.', user });
    }

    let studentCheck = await Student.findOne({ rollNumber });
    if (studentCheck) {
      return res.status(400).json({ success: false, error: 'Roll number already registered' });
    }

    user = await User.create({
      name,
      email,
      password,
      role: 'student',
      isVerified: true
    });

    const student = await Student.create({
      user: user._id,
      rollNumber,
      department,
      yearOfStudy
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};




exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, error: 'Please provide email, password and login role' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ success: false, error: `Invalid credentials for role: ${role}` });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, error: 'Your account is pending Super Admin verification' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};




exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ user: user._id })
        .populate('bookmarks');
    } else if (user.role === 'club_admin') {
      
      profile = await Club.findOne({ clubHead: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      profile
    });
  } catch (err) {
    next(err);
  }
};




exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, error: 'No user registered with that email' });
    }

    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    
    user.otpCode = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log(`[SIMULATED EMAIL] OTP for ${email}: ${otp}`);

    res.status(200).json({
      success: true,
      message: 'OTP sent to email (simulated in server logs)'
    });
  } catch (err) {
    next(err);
  }
};




exports.resetPassword = async (req, res, next) => {
  try {
    const { email, otpCode, newPassword } = req.body;

    const user = await User.findOne({
      email,
      otpCode,
      otpExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }

    
    user.password = newPassword;
    user.otpCode = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    next(err);
  }
};
