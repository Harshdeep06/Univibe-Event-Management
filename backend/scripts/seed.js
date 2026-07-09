const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Student = require('../models/Student');
const Club = require('../models/Club');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const ClubMember = require('../models/ClubMember');
const Announcement = require('../models/Announcement');
const Attendance = require('../models/Attendance');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/univibe');
    console.log('Connected to DB for seeding...');

    await User.deleteMany();
    await Student.deleteMany();
    await Club.deleteMany();
    await Event.deleteMany();
    await Registration.deleteMany();
    await ClubMember.deleteMany();
    await Announcement.deleteMany();
    console.log('Cleared all collections.');

    const superAdmin = await User.create({
      name: 'Dr. Rajesh Sharma',
      email: 'admin@univibe.edu',
      password: 'adminpassword',
      role: 'super_admin',
      isVerified: true
    });
    console.log('Super Admin user created: admin@univibe.edu / adminpassword');

    const codingAdmin = await User.create({
      name: 'Aravind Kumar',
      email: 'codinghead@univibe.edu',
      password: 'clubpassword',
      role: 'club_admin',
      isVerified: true
    });

    const roboticsAdmin = await User.create({
      name: 'Sneha Patel',
      email: 'roboticshead@univibe.edu',
      password: 'clubpassword',
      role: 'club_admin',
      isVerified: true
    });

    const musicAdmin = await User.create({
      name: 'Rahul Mishra',
      email: 'musichead@univibe.edu',
      password: 'clubpassword',
      role: 'club_admin',
      isVerified: true
    });

    const cAdmin = await User.create({
      name: 'Dennis Ritchie',
      email: 'chead@univibe.edu',
      password: 'clubpassword',
      role: 'club_admin',
      isVerified: true
    });

    const studyAdmin = await User.create({
      name: 'Albert Einstein',
      email: 'studyhead@univibe.edu',
      password: 'clubpassword',
      role: 'club_admin',
      isVerified: true
    });
    console.log('Club Admin users created.');

    const codingClub = await Club.create({
      name: 'Coding Club',
      description: 'The hub for all programming enthusiasts. We conduct hackathons, coding contests, and algorithm learning workshops.',
      facultyCoordinator: 'Dr. Amit Varma',
      clubHead: codingAdmin._id,
      logo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
      achievements: ['Won Inter-University Hackathon 2025', 'Organized National Coding League with 500+ participants'],
      membersCount: 0
    });

    const roboticsClub = await Club.create({
      name: 'Robotics Club',
      description: 'Bringing machine intelligence to life. Join us to design, assemble, and program real bots, drones, and automation systems.',
      facultyCoordinator: 'Prof. Devendra Roy',
      clubHead: roboticsAdmin._id,
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
      achievements: ['Best Tech Project Award - TechFest 2025', 'Constructed first Autonomous Campus Rover'],
      membersCount: 0
    });

    const musicClub = await Club.create({
      name: 'Music Club',
      description: 'Where rhythm meets soul. From classical symphonies to rock performances, we bring the vibe to the campus.',
      facultyCoordinator: 'Dr. Anjali Sen',
      clubHead: musicAdmin._id,
      logo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
      achievements: ['Winners of Symphony Fusion 2025', 'Composed the official University Anthem'],
      membersCount: 0
    });

    const cClub = await Club.create({
      name: 'C Club',
      description: 'Dedicated to systems-level C/C++ programming, kernel hacking, and high-performance engineering. We code close to the metal.',
      facultyCoordinator: 'Dr. Ken Thompson',
      clubHead: cAdmin._id,
      logo: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80',
      achievements: ['Optimized College Server Core to C23 standard', 'Developed Custom OS Kernel mock bootloader'],
      membersCount: 0
    });

    const studyClub = await Club.create({
      name: 'Study Club',
      description: 'A structured peer-learning space for competitive exams, technical research papers, and academic collaborations.',
      facultyCoordinator: 'Prof. Marie Curie',
      clubHead: studyAdmin._id,
      logo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=150&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
      achievements: ['30+ Research papers published in international journals', 'Conducted 50+ successful peer learning camps'],
      membersCount: 0
    });
    console.log('Clubs created.');

    const studentUsersData = [
      { name: 'Gurpreet Singh', email: 'student1@univibe.edu', password: 'studentpassword', rollNumber: 'CS2023001', dept: 'Computer Science', year: 3, points: 0, badges: [] },
      { name: 'Harpreet Kaur', email: 'student2@univibe.edu', password: 'studentpassword', rollNumber: 'CS2023002', dept: 'Information Technology', year: 3, points: 0, badges: [] },
      { name: 'Manpreet Singh', email: 'student3@univibe.edu', password: 'studentpassword', rollNumber: 'EE2024005', dept: 'Electrical Engineering', year: 2, points: 0, badges: [] },
      { name: 'Jaspreet Kaur', email: 'student4@univibe.edu', password: 'studentpassword', rollNumber: 'ME2022019', dept: 'Mechanical Engineering', year: 4, points: 0, badges: [] },
      { name: 'Navjot Singh', email: 'student5@univibe.edu', password: 'studentpassword', rollNumber: 'CS2025042', dept: 'Computer Science', year: 1, points: 0, badges: [] }
    ];

    const students = [];
    for (const data of studentUsersData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'student',
        isVerified: true
      });

      const student = await Student.create({
        user: user._id,
        rollNumber: data.rollNumber,
        department: data.dept,
        yearOfStudy: data.year,
        rewardPoints: data.points,
        badges: data.badges
      });
      students.push(student);
    }
    console.log('Students and associated student users created.');

    const m1 = await ClubMember.create({ club: codingClub._id, student: students[0]._id, status: 'approved' });
    const m2 = await ClubMember.create({ club: codingClub._id, student: students[1]._id, status: 'approved' });
    const m3 = await ClubMember.create({ club: roboticsClub._id, student: students[2]._id, status: 'approved' });
    const m4 = await ClubMember.create({ club: codingClub._id, student: students[3]._id, status: 'pending' });

    codingClub.membersCount = 2;
    await codingClub.save();
    roboticsClub.membersCount = 1;
    await roboticsClub.save();
    console.log('Club memberships created.');

    const now = new Date();
    const event1 = await Event.create({
      name: 'ByteCode Hackathon 2026',
      description: 'A 24-hour campus hackathon addressing smart university logistics, green energy solutions, and modern educational tools. Prizes for top 3 teams.',
      category: 'Hackathon',
      organizerClub: codingClub._id,
      venue: { building: 'Netaji Block', room: 'Seminar Hall 3', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), 
      time: '09:00 AM',
      registrationDeadline: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
      maxParticipants: 100,
      rules: ['Maximum team size of 4 members', 'All code must be written during the event', 'Open source frameworks allowed'],
      prizes: ['Rs. 25,000 Cash Prize + Trophy', 'Rs. 15,000 Runner Up', 'Rs. 10,000 Third Place'],
      requirements: ['Bring your own laptops', 'Basic understanding of Web/App development', 'GitHub profile'],
      difficulty: 'Intermediate',
      status: 'published',
      qrCodeUrl: '/uploads/qr-events-1.png'
    });

    const event2 = await Event.create({
      name: 'RoboQuest Obstacle Course',
      description: 'Program or build your robotic vehicle to clear a complex obstacle run in the fastest time. Sensors allowed.',
      category: 'Workshop',
      organizerClub: roboticsClub._id,
      venue: { building: 'Aryabhatta Block', room: 'Robotics Center Lab', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), 
      time: '11:00 AM',
      registrationDeadline: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
      maxParticipants: 50,
      rules: ['Chassis sizes must match 30cm limit', 'Both remote controlled and autonomous vehicles allowed'],
      prizes: ['Rs. 15,000 for Winner', 'Rs. 7,000 Runner Up'],
      requirements: ['Basic electronics toolkit', 'Breadboard components'],
      difficulty: 'Advanced',
      status: 'published',
      qrCodeUrl: '/uploads/qr-events-2.png'
    });

    const event3 = await Event.create({
      name: 'Acoustic Jam Night',
      description: 'An evening of live unplugged strings, vocals, and keyboard setups. Join to jam or just relax.',
      category: 'Music',
      organizerClub: musicClub._id,
      venue: { building: 'Auditorium complex', room: 'Open Amphitheatre', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), 
      time: '06:00 PM',
      registrationDeadline: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      maxParticipants: 150,
      rules: ['No digital synthesizers allowed', 'Each slot limited to 7 minutes'],
      prizes: ['Performance badge', 'Acoustic Jam Trophy'],
      requirements: ['Bring your instruments (guitar/ukulele/cajon)'],
      difficulty: 'Beginner',
      status: 'published',
      qrCodeUrl: '/uploads/qr-events-3.png'
    });

    const event4 = await Event.create({
      name: 'English Orators Clash (Speaking Competition)',
      description: 'A university-wide debate and public speaking competition. Stand up, speak out, and persuade the jury on modern socio-technical topics.',
      category: 'Seminar',
      organizerClub: codingClub._id,
      venue: { building: 'Aryabhatta Block', room: 'Conference Hall A', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000), 
      time: '02:00 PM',
      registrationDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      maxParticipants: 40,
      rules: ['Each speaker gets exactly 5 minutes', 'No reading from paper allowed', 'Topics are assigned 1 hour in advance'],
      prizes: ['Rs. 5,000 for Winner + Best Speaker Trophy', 'Rs. 3,000 Runner Up'],
      requirements: ['Formal wear required'],
      difficulty: 'Intermediate',
      status: 'published',
      qrCodeUrl: '/uploads/qr-events-4.png'
    });

    const event5 = await Event.create({
      name: 'Campus Dance Face-Off 2026',
      description: 'The ultimate rhythmic duel. Solo and group performances from classical, western, hip-hop, and freestyle dance forms.',
      category: 'Music',
      organizerClub: musicClub._id,
      venue: { building: 'Auditorium complex', room: 'Main Stage', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000), 
      time: '05:30 PM',
      registrationDeadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
      maxParticipants: 80,
      rules: ['Performances must not exceed 6 minutes', 'Bring your own soundtrack on a USB drive'],
      prizes: ['Rs. 10,000 Solo Winner', 'Rs. 20,000 Group Winners'],
      requirements: ['Submit tracks at least 24 hours prior'],
      difficulty: 'Beginner',
      status: 'published',
      qrCodeUrl: '/uploads/qr-events-5.png'
    });

    const event6 = await Event.create({
      name: 'Library Digitization Drive (Volunteering)',
      description: 'Volunteer with the Central Library team to categorize, scan, and archive legacy university journals and old scientific manuscripts.',
      category: 'Workshop',
      organizerClub: codingClub._id,
      venue: { building: 'Central Library', room: 'Archive Section (Ground Floor)', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), 
      time: '10:00 AM',
      registrationDeadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
      maxParticipants: 30,
      rules: ['Volunteers must complete at least 4 hours of archiving', 'Follow scanning instructions carefully'],
      prizes: ['Official Volunteering badge + 100 reward points'],
      requirements: ['No prior experience needed', 'Laptops optional'],
      difficulty: 'Beginner',
      status: 'published',
      qrCodeUrl: '/uploads/qr-events-6.png'
    });

    const event7 = await Event.create({
      name: 'Literary Chronicles (Book Show)',
      description: 'A massive display of literature, science-fiction, historical archives, and academic publications. Meet local authors and exchange books.',
      category: 'Seminar',
      organizerClub: musicClub._id,
      venue: { building: 'Central Library', room: 'Exhibition Hall 2', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000), 
      time: '11:00 AM',
      registrationDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      maxParticipants: 200,
      rules: ['Free entry for all registered students', 'Book exchanges must be logged at the counter'],
      prizes: ['Collectible badges for active book exchanges'],
      requirements: ['Bring books you want to trade or donate'],
      difficulty: 'Beginner',
      status: 'published',
      qrCodeUrl: '/uploads/qr-events-7.png'
    });

    const event8 = await Event.create({
      name: 'MindSpark General Trivia Quiz',
      description: 'Test your knowledge across science, pop culture, history, and technology. Teams of 2 will compete in rounds of rapid-fire trivia.',
      category: 'Quiz',
      organizerClub: roboticsClub._id,
      venue: { building: 'Netaji Block', room: 'Room 201', mapCoords: 'https://maps.google.com' },
      date: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000), 
      time: '03:00 PM',
      registrationDeadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      maxParticipants: 60,
      rules: ['No mobile phones or electronic gadgets allowed', 'Teams must register before the deadline'],
      prizes: ['Rs. 6,000 for Winner + Trivia Shield', 'Rs. 4,000 Runner Up'],
      requirements: ['Team of two students'],
      difficulty: 'Intermediate',
      status: 'pending_approval',
      qrCodeUrl: '/uploads/qr-events-8.png'
    });

    console.log('Events created.');

    await Registration.create({
      event: event1._id,
      student: students[0]._id,
      ticketCode: 'TKT-BYTE890',
      status: 'registered'
    });

    await Registration.create({
      event: event1._id,
      student: students[1]._id,
      ticketCode: 'TKT-BYTE891',
      status: 'registered'
    });

    await Registration.create({
      event: event2._id,
      student: students[1]._id,
      ticketCode: 'TKT-ROBO712',
      status: 'registered'
    });

    await Registration.create({
      event: event2._id,
      student: students[2]._id,
      ticketCode: 'TKT-ROBO713',
      status: 'registered'
    });

    await Registration.create({
      event: event4._id,
      student: students[0]._id,
      ticketCode: 'TKT-SPEAK101',
      status: 'registered'
    });

    await Registration.create({
      event: event6._id,
      student: students[0]._id,
      ticketCode: 'TKT-VOL001',
      status: 'attended'
    });

    await Attendance.create({
      event: event6._id,
      student: students[0]._id,
      status: 'present',
      markedBy: superAdmin._id,
      badgeAwarded: 'Volunteering Enthusiast'
    });

    students[0].rewardPoints += 50;
    students[0].badges.push('Volunteering Enthusiast');
    await students[0].save();

    await Registration.create({
      event: event8._id,
      student: students[0]._id,
      ticketCode: 'TKT-QUIZ202',
      status: 'registered'
    });

    console.log('Event registrations seeded.');

    await Announcement.create({
      title: 'ByteCode Registration Closing Soon!',
      content: 'Make sure your teams are finalized by Friday. Spot entries will not be allowed.',
      club: codingClub._id,
      createdBy: codingAdmin._id
    });

    await Announcement.create({
      title: 'University TechFest 2026 Announced',
      content: 'The official calendar for TechFest 2026 has been approved by the Dean. All clubs are requested to submit draft event plans by next week.',
      club: null,
      createdBy: superAdmin._id
    });

    await Announcement.create({
      title: 'Volunteers Needed: Library Digitization Drive',
      content: 'Volunteers will earn +100 reward points and a badge of appreciation. Slots available for this weekend.',
      club: codingClub._id,
      createdBy: codingAdmin._id
    });

    await Announcement.create({
      title: 'Compiler Optimization Techniques Journal',
      content: 'Dennis Ritchie posted a new journal entry regarding custom OS bootloaders and gcc compiler optimization flags. Join C Club weekly meeting this Thursday.',
      club: cClub._id,
      createdBy: cAdmin._id
    });

    await Announcement.create({
      title: 'Peer Learning Peer Study Session',
      content: 'Albert Einstein will head a physics review study session on Quantum Mechanics and Relativity this Friday under the Study Club.',
      club: studyClub._id,
      createdBy: studyAdmin._id
    });

    console.log('Announcements seeded.');
    console.log('Database Seeding Completed Successfully.');
    process.exit();
  } catch (err) {
    console.error(`Seeding error: ${err}`);
    process.exit(1);
  }
};

seedDB();
