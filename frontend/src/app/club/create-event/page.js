'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { useRouter } from 'next/navigation';
import { Calendar, Layers, MapPin, Award, BookOpen, Trophy, Loader, ArrowLeft } from 'lucide-react';

export default function CreateEvent() {
  const { user, profile } = useAuth();
  const router = useRouter();

  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Hackathon');
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('100');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [certificateEnabled, setCertificateEnabled] = useState(true);
  const [attendanceRequired, setAttendanceRequired] = useState(true);
  const [rules, setRules] = useState('');
  const [prizes, setPrizes] = useState('');
  const [requirements, setRequirements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      setError(null);

      
      const rulesArr = rules.split('\n').map(r => r.trim()).filter(Boolean);
      const prizesArr = prizes.split('\n').map(p => p.trim()).filter(Boolean);
      const reqsArr = requirements.split('\n').map(req => req.trim()).filter(Boolean);

      const res = await API.post('/events', {
        name,
        description,
        category,
        organizerClubId: profile._id,
        building,
        room,
        date: new Date(date),
        time,
        registrationDeadline: new Date(deadline),
        maxParticipants: Number(maxParticipants),
        rules: rulesArr,
        prizes: prizesArr,
        requirements: reqsArr,
        certificateEnabled,
        attendanceRequired,
        difficulty
      });

      if (res.data.success) {
        alert('Event proposal submitted! Pending Super Admin approval before listing.');
        router.push('/club');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event. Verify parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {}
        <button
          onClick={() => router.push('/club')}
          className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#3D56B2] transition-colors"
        >
          <ArrowLeft size={13} />
          Back to Dashboard
        </button>

        {}
        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5">Propose University Event</h2>
          <p className="text-xs text-[#757575] mb-6">Fill in parameters. Events submitted by clubs require Super Admin review.</p>

          {error && (
            <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-3 rounded-xl text-xs mb-4 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            
            {}
            <div>
              <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Event Title</label>
              <input
                type="text"
                required
                placeholder="e.g. CodeStorm 2026 Hackathon"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
              />
            </div>

            {}
            <div>
              <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Detailed Description</label>
              <textarea
                required
                rows={4}
                placeholder="Scope, session timelines, keynote speakers details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none resize-none"
              />
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                >
                  <option value="Hackathon">Hackathon</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Seminar">Seminar</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Difficulty level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Max Participants limit</label>
                <input
                  type="number"
                  required
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Building</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netaji Block"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Room / Hall</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 302 / Seminar Auditorium"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Event Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Start Time</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10:00 AM"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Registration Deadline</label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Rules (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="Rule 1&#10;Rule 2"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Prizes (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="Rs. 10,000 for Winner&#10;Certificate for runners"
                  value={prizes}
                  onChange={(e) => setPrizes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none resize-none"
                />
              </div>
            </div>

            {}
            <div>
              <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Student Requirements (One per line)</label>
              <textarea
                rows={2}
                placeholder="Laptop required&#10;Basic javascript experience"
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none resize-none"
              />
            </div>

            {}
            <div className="flex gap-6 py-2 border-t border-gray-100 dark:border-gray-700">
              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={certificateEnabled}
                  onChange={(e) => setCertificateEnabled(e.target.checked)}
                  className="rounded text-[#3D56B2] focus:ring-[#3D56B2]"
                />
                Generate Certificate upon attendance check-in
              </label>

              <label className="flex items-center gap-2 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={attendanceRequired}
                  onChange={(e) => setAttendanceRequired(e.target.checked)}
                  className="rounded text-[#3D56B2] focus:ring-[#3D56B2]"
                />
                Automated QR Attendance required
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all shadow flex items-center justify-center gap-1"
            >
              {loading ? <Loader className="animate-spin" size={13} /> : 'Submit Event Proposal'}
            </button>

          </form>
        </div>

      </div>
    </DashboardLayout>
  );
}
