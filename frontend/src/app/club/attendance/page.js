'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/ui/DashboardLayout';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../services/api';
import { FileSpreadsheet, Loader, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ClubAttendance() {
  const { profile } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [ticketInput, setTicketInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (profile) {
      fetchClubEvents(profile._id);
    }
  }, [profile]);

  const fetchClubEvents = async (clubId) => {
    try {
      setLoading(true);
      const res = await API.get(`/events?clubId=${clubId}`);
      if (res.data.success) {
        const publishedEvents = res.data.events.filter(e => e.status === 'published');
        setEvents(publishedEvents);
        if (publishedEvents.length > 0) {
          setSelectedEventId(publishedEvents[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching club events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPresent = async (e) => {
    e.preventDefault();
    if (!selectedEventId || !ticketInput.trim()) return;

    try {
      setMarking(true);
      setStatus(null);
      const res = await API.post(`/events/${selectedEventId}/mark-attendance`, { ticketCode: ticketInput.trim() });
      if (res.data.success) {
        setStatus({
          success: true,
          message: `Attendance marked! student roll ${res.data.studentName} is present. Reward points: ${res.data.rewardPoints} (+50 pts granted).`
        });
        setTicketInput('');
      }
    } catch (err) {
      setStatus({ success: false, message: err.response?.data?.error || 'Failed to register check-in' });
    } finally {
      setMarking(false);
    }
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

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-6 text-xs">
        <button onClick={() => router.push('/club')} className="flex items-center gap-1.5 text-xs text-[#757575] hover:text-[#3D56B2]">
          <ArrowLeft size={13} /> Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-cardBig p-6 border border-gray-100 dark:border-gray-700 shadow-cardFloating">
          <h2 className="text-xl font-bold text-[#1A1A1A] dark:text-white mb-1.5 flex items-center gap-1.5">
            <FileSpreadsheet className="text-[#3D56B2]" size={20} />
            Event Check-In Registry
          </h2>
          <p className="text-xs text-[#757575] mb-6">Mark registrations present manually using student ticket codes.</p>

          {status && (
            <div className={`p-3 rounded-xl text-xs mb-3 border ${
              status.success ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-600 border-red-100'
            }`}>
              {status.message}
            </div>
          )}

          {events.length > 0 ? (
            <form onSubmit={handleMarkPresent} className="space-y-4">
              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Select Live Event</label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                >
                  {events.map((e) => (
                    <option key={e._id} value={e._id}>{e.name} ({new Date(e.date).toLocaleDateString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1A1A1A] dark:text-gray-300 mb-1">Student Ticket Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TKT-BYTE890"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs focus:ring-1 focus:ring-[#3D56B2] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={marking}
                className="w-full py-2.5 bg-[#3D56B2] hover:bg-[#2C3E8A] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 shadow"
              >
                {marking ? <Loader className="animate-spin" size={12} /> : 'Mark Attended & Grant Reward'}
              </button>
            </form>
          ) : (
            <p className="text-xs text-[#757575] dark:text-gray-400 italic">No published events found for check-in.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
