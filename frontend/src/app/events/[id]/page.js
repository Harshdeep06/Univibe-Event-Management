'use client';

import React, { useEffect, useState, useRef } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  Award,
  BookOpen,
  Trophy,
  AlertTriangle,
  QrCode,
  Download,
  Trash2,
  CheckCircle,
  Star,
  UserCheck
} from 'lucide-react';

export default function EventDetail() {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  
  const [registering, setRegistering] = useState(false);

  
  const [ticketInput, setTicketInput] = useState('');
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [checkinMessage, setCheckinMessage] = useState(null);

  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  
  const canvasRef = useRef(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.event);
        setFeedback(res.data.feedback || []);
      }

      
      if (user && user.role === 'student') {
        const studentDashboardRes = await API.get('/students/dashboard');
        if (studentDashboardRes.data.success) {
          
          const calendarRes = await API.get('/students/calendar');
          if (calendarRes.data.success) {
            const match = calendarRes.data.events.find(e => e._id === id);
            if (match) {
              
              
              
            }
          }
        }

        
        const meRes = await API.get('/auth/me');
        if (meRes.data.success && meRes.data.profile) {
          const studentId = meRes.data.profile._id;
          const registrationsRes = await API.get(`/events/${id}/registrations`).catch(() => null);
          if (registrationsRes && registrationsRes.data.success) {
            const myReg = registrationsRes.data.registrations.find(r => r.student?._id === studentId);
            if (myReg) {
              setRegistration(myReg);
            } else {
              setRegistration(null);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching event detail context:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    try {
      setRegistering(true);
      const res = await API.post(`/events/${id}/register`);
      if (res.data.success) {
        setRegistration(res.data.registration);
        fetchEventDetails();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleCancelRegistration = async () => {
    if (!confirm('Are you sure you want to cancel your digital ticket?')) return;
    try {
      const res = await API.post(`/events/${id}/cancel`);
      if (res.data.success) {
        setRegistration(null);
        fetchEventDetails();
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel registration');
    }
  };

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!ticketInput.trim()) return;

    try {
      setMarkingAttendance(true);
      setCheckinMessage(null);
      const res = await API.post(`/events/${id}/mark-attendance`, { ticketCode: ticketInput.trim() });
      if (res.data.success) {
        setCheckinMessage({
          success: true,
          message: `Check-in Successful! Present: ${res.data.studentName}. Earned +50 Reward points.`
        });
        setTicketInput('');
        fetchEventDetails();
      }
    } catch (err) {
      setCheckinMessage({
        success: false,
        message: err.response?.data?.error || 'Failed to log check-in code'
      });
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handlePostFeedback = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingFeedback(true);
      setFeedbackError(null);
      const res = await API.post(`/events/${id}/feedback`, { rating, comment });
      if (res.data.success) {
        setComment('');
        fetchEventDetails();
      }
    } catch (err) {
      setFeedbackError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  
  const generateAndDownloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    
    canvas.width = 800;
    canvas.height = 600;

    
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, '#3D56B2');
    gradient.addColorStop(1, '#5C7AEA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(20, 20, 760, 560);

    
    ctx.font = 'bold 32px Poppins, sans-serif';
    ctx.fillStyle = '#1A1A1A';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF PARTICIPATION', 400, 100);

    
    ctx.font = 'normal 14px Inter, sans-serif';
    ctx.fillStyle = '#757575';
    ctx.fillText('This credential verifies that', 400, 170);

    
    ctx.font = 'bold 28px Poppins, sans-serif';
    ctx.fillStyle = '#3D56B2';
    ctx.fillText(user?.name || 'Gurpreet Singh', 400, 230);

    
    ctx.font = 'normal 13px Inter, sans-serif';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(`has successfully registered, attended, and completed the event:`, 400, 290);

    ctx.font = 'bold 16px Poppins, sans-serif';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText(`"${event?.name}"`, 400, 330);

    ctx.font = 'normal 13px Inter, sans-serif';
    ctx.fillStyle = '#757575';
    ctx.fillText(`organized by ${event?.organizerClub?.name || 'UNIVIBE Club'} on ${new Date(event?.date).toLocaleDateString()}`, 400, 370);

    
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    ctx.strokeRect(35, 35, 730, 530);

    
    ctx.font = 'italic 14px Brush Script MT, cursive, sans-serif';
    ctx.fillStyle = '#1A1A1A';
    ctx.fillText('Faculty Coordinator Sig', 400, 480);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#757575';
    ctx.beginPath();
    ctx.moveTo(300, 490);
    ctx.lineTo(500, 490);
    ctx.stroke();

    ctx.font = 'normal 11px Inter, sans-serif';
    ctx.fillStyle = '#757575';
    ctx.fillText('UNIVIBE Credentials verify code: ' + (registration?.ticketCode || 'CERT-UV890'), 400, 530);

    
    const link = document.createElement('a');
    link.download = `UNIVIBE-Certificate-${event?.name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-4 border-[#3D56B2] border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const isExpired = new Date(event?.registrationDeadline) < new Date();
  const isOrganizer = user?.role === 'super_admin' || (user?.role === 'club_admin' && event?.organizerClub?.clubHead === user?.id);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {}
        <div className="lg:col-span-2 space-y-6">
          
          {}
          <div className="bg-white dark:bg-gray-800 rounded-cardBig shadow-cardFloating overflow-hidden border border-gray-100 dark:border-gray-700">
            {event?.posterUrl && (
              <div className="h-64 sm:h-80 w-full relative bg-gray-100 dark:bg-gray-900">
                <img src={event.posterUrl} alt={event.name} className="object-cover w-full h-full" />
              </div>
            )}
            
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <span className="bg-[#E0E5F5] text-[#3D56B2] px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">
                  {event?.category}
                </span>
                <h1 className="text-2xl font-extrabold text-[#1A1A1A] dark:text-white mt-3">{event?.name}</h1>
                <p className="text-xs text-[#757575] dark:text-gray-400 mt-1">Host Club: {event?.organizerClub?.name}</p>
              </div>

              {}
              <div className="text-xs text-[#1A1A1A] dark:text-gray-300 space-y-2 leading-relaxed">
                <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">About the Event</h3>
                <p>{event?.description}</p>
              </div>

              {}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-y border-gray-100 dark:border-gray-700 py-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <Calendar className="text-[#3D56B2]" size={16} />
                  <div>
                    <h4 className="font-bold">Schedule Date</h4>
                    <p className="text-[#757575] mt-0.5">{new Date(event?.date).toLocaleDateString()} at {event?.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin className="text-[#3D56B2]" size={16} />
                  <div>
                    <h4 className="font-bold">Location Venue</h4>
                    <p className="text-[#757575] mt-0.5">{event?.venue?.building} • {event?.venue?.room}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Award className="text-[#3D56B2]" size={16} />
                  <div>
                    <h4 className="font-bold">Certificates Status</h4>
                    <p className="text-[#757575] mt-0.5">{event?.certificateEnabled ? 'Automated Issue' : 'No Certificates'}</p>
                  </div>
                </div>
              </div>

              {}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                {event?.rules?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-2 flex items-center gap-1">
                      <BookOpen size={14} className="text-[#3D56B2]" /> Rules & Regulations
                    </h3>
                    <ul className="list-disc pl-4 space-y-1 text-[#757575] dark:text-gray-300">
                      {event.rules.map((rule, idx) => (
                        <li key={idx}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {event?.prizes?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-[#1A1A1A] dark:text-white mb-2 flex items-center gap-1">
                      <Trophy size={14} className="text-[#3D56B2]" /> Cash Prizes
                    </h3>
                    <ul className="list-disc pl-4 space-y-1 text-[#757575] dark:text-gray-300">
                      {event.prizes.map((prize, idx) => (
                        <li key={idx} className="font-semibold text-[#3D56B2]">{prize}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig border border-gray-100 dark:border-gray-700 space-y-6">
            <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white">Student Feedback Reviews ({feedback.length})</h3>

            {}
            {registration?.status === 'attended' && (
              <form onSubmit={handlePostFeedback} className="bg-[#F4F6F9] dark:bg-gray-700 p-4 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-[#1A1A1A] dark:text-white">Leave Event Feedback</h4>
                
                {feedbackError && <p className="text-red-500 text-[10px]">{feedbackError}</p>}

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#757575]">Rating stars:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 text-yellow-500"
                    >
                      <Star size={16} fill={star <= rating ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>

                <textarea
                  required
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details regarding speakers, organization, or learning material..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none resize-none"
                />

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 bg-[#3D56B2] text-white text-xs font-semibold rounded-lg hover:bg-[#2C3E8A] transition-all"
                >
                  Post Review
                </button>
              </form>
            )}

            {}
            {feedback.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700 text-xs">
                {feedback.map((review, idx) => (
                  <div key={idx} className="py-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#1A1A1A] dark:text-white">{review.student?.user?.name || 'Gurpreet Singh'}</span>
                      <div className="flex gap-0.5 text-yellow-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={11} fill="currentColor" />
                        ))}
                      </div>
                    </div>
                    <p className="text-[#757575] dark:text-gray-300">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#757575] dark:text-gray-400 italic">No reviews posted yet.</p>
            )}
          </div>

        </div>

        {}
        <div className="space-y-6 text-xs">
          
          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig border border-gray-100 dark:border-gray-700 shadow-cardFloating">
            
            {}
            {user?.role === 'student' && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white">Registration Portal</h3>

                {!registration ? (
                  <div className="space-y-3">
                    <p className="text-[#757575]">Registration is open for students. Secure your digital code card below.</p>
                    <div className="text-[10px] text-[#757575]">
                      <p>⚠️ Deadline: {new Date(event?.registrationDeadline).toLocaleString()}</p>
                    </div>

                    <button
                      onClick={handleRegister}
                      disabled={registering || isExpired}
                      className="w-full py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all shadow flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      {registering ? 'Booking Ticket...' : isExpired ? 'Deadline Passed' : 'Register & Get Ticket'}
                    </button>
                  </div>
                ) : registration.status === 'registered' ? (
                  <div className="space-y-4 text-center">
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl font-semibold border border-green-100 flex items-center justify-center gap-1">
                      <CheckCircle size={15} />
                      Registered successfully!
                    </div>

                    {}
                    <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 bg-gray-50/50 dark:bg-gray-900/30 flex flex-col items-center">
                      <span className="font-bold text-xs uppercase tracking-wider text-[#3D56B2]">{registration.ticketCode}</span>
                      <div className="w-32 h-32 bg-white border border-gray-200 rounded-lg p-2.5 mt-3 flex items-center justify-center">
                        <QrCode size={100} className="text-[#1A1A1A]" />
                      </div>
                      <span className="text-[9px] text-[#757575] mt-2">Check-in Presenter Code</span>
                    </div>

                    <button
                      onClick={handleCancelRegistration}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg flex items-center justify-center gap-1 text-[10px] border border-red-100 transition-all"
                    >
                      <Trash2 size={13} />
                      Cancel Registration
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl font-semibold border border-green-100 flex items-center justify-center gap-1">
                      <CheckCircle size={15} />
                      Attended Check-in Logged!
                    </div>

                    {}
                    <canvas ref={canvasRef} style={{ display: 'none' }} />

                    {event?.certificateEnabled && (
                      <button
                        onClick={generateAndDownloadCertificate}
                        className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow transition-all"
                      >
                        <Download size={14} />
                        Download Certificate
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {}
            {isOrganizer && (
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-[#1A1A1A] dark:text-white flex items-center gap-1">
                  <UserCheck size={16} className="text-[#3D56B2]" /> Check-in Presenters Console
                </h3>
                
                {checkinMessage && (
                  <div className={`p-3 rounded-xl text-[10px] border ${
                    checkinMessage.success
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {checkinMessage.message}
                  </div>
                )}

                <form onSubmit={handleMarkAttendance} className="space-y-3">
                  <p className="text-[#757575]">Type or scan student ticket code manually to log attendance:</p>
                  
                  <input
                    type="text"
                    required
                    placeholder="e.g. TKT-BYTE890"
                    value={ticketInput}
                    onChange={(e) => setTicketInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                  />

                  <button
                    type="submit"
                    disabled={markingAttendance}
                    className="w-full py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow"
                  >
                    {markingAttendance ? 'Processing...' : 'Mark Present & Grant Points'}
                  </button>
                </form>
              </div>
            )}

            {}
            {!user && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#1A1A1A]">Registration Locked</h3>
                <p className="text-[#757575]">Please sign in with your student profile to register and receive digital ticket credentials.</p>
                <button
                  onClick={() => router.push('/login')}
                  className="w-full py-2 bg-[#3D56B2] text-white font-semibold rounded-lg hover:bg-[#2C3E8A] transition-all"
                >
                  Sign In
                </button>
              </div>
            )}

          </div>

          {}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-cardBig border border-gray-100 dark:border-gray-700 shadow-cardFloating space-y-3">
            <h3 className="font-bold text-[#1A1A1A] dark:text-white">Venue Directions</h3>
            <div className="w-full h-32 rounded-lg bg-[#EFEFEF] dark:bg-gray-900 flex items-center justify-center text-[#757575] text-[10px] font-semibold text-center p-3 border border-gray-200 dark:border-gray-700">
              📍 Map Coordinates: {event?.venue?.building} Block, Room {event?.venue?.room}
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
